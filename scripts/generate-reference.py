"""Generate fixtures by executing pinned upstream hash/g-value/scoring functions.

NumPy supplies the integer array operations normally provided by PyTorch/JAX.
This validates these functions, not the complete model-generation pipeline.
"""
import ast
import hashlib
import json
import struct
import sys
from pathlib import Path
from types import SimpleNamespace
import numpy as np

sys.path.insert(0, str(Path('.tools/python').resolve()))
import sentencepiece as spm
import tiktoken

ROOT = Path('tests/reference/upstream')
ROOT.mkdir(parents=True, exist_ok=True)
commit = 'a6ec02c22ce87177c061643503e14a7cc839dc2b'

class TorchOperations:
    """Provide NumPy's signed int64 operations for the selected upstream functions."""
    @staticmethod
    def LongTensor(value):
        """Convert integer values to the reference array representation.

        Args:
            value: Integer scalar or sequence accepted by NumPy.
        Returns:
            A signed int64 NumPy array.
        """
        return np.asarray(value, dtype=np.int64)
    add = staticmethod(np.add)
    mul = staticmethod(np.multiply)

namespace = {'torch': TorchOperations, 'jnp': np}
def load_function(file, name):
    """Compile one upstream function without unrelated framework dependencies.

    Args:
        file: Filename beneath tests/reference/upstream.
        name: Function or class-method name to extract.
    Returns:
        The compiled upstream callable in the NumPy-compatible namespace.
    """
    tree = ast.parse((ROOT / file).read_text(encoding='utf8'))
    function = next(node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef) and node.name == name)
    module = ast.Module(body=[function], type_ignores=[])
    exec(compile(ast.fix_missing_locations(module), str(ROOT / file), 'exec'), namespace)
    return namespace[name]

hash_function = load_function('hashing_function.py', 'accumulate_hash')
namespace['hashing_function'] = SimpleNamespace(accumulate_hash=hash_function)
gvalues_function = load_function('logits_processing.py', 'get_gvals')
mean_function = load_function('detector_mean.py', 'mean_score')
weighted_function = load_function('detector_mean.py', 'weighted_mean_score')
default_keys = [654,400,836,123,340,443,597,160,57,29,590,639,13,715,468,990,966,226,324,585,118,504,421,521,129,669,732,225,90,960]
specs = [
    (list(range(30)), default_keys, 5, 1024),
    ([1,2,1,2,1,2,1,2], [1,-2,3], 2, 2),
    ([1,2,1,2,1,2,1,2], [1], 2, 1),
    ([0,9007199254740991,0,123,456,789], [-9007199254740991,0,9007199254740991], 3, 4),
    ([1,2,3,4,5], default_keys, 5, 1),
]
vectors = []
for tokens, keys, length, history_size in specs:
    digest = hashlib.sha256(b''.join(struct.pack('<q', key) for key in keys)).digest()
    iv = int.from_bytes(digest, 'big') % (2**63-1)
    history = [0] * history_size
    mask = []
    bases = []
    values = []
    for index in range(len(tokens)-length+1):
        context_hash = int(hash_function(np.int64(iv), np.array(tokens[index:index+length-1], dtype=np.int64)))
        mask.append(int(context_hash not in history))
        history = [context_hash] + history[:-1]
        base = hash_function(np.int64(iv),np.array(tokens[index:index+length],dtype=np.int64))
        bases.append(int(base))
        layer_hashes = np.array([hash_function(base,np.array([key],dtype=np.int64)) for key in keys])
        values.append(gvalues_function(None,layer_hashes).tolist())
    array = np.array([values],dtype=np.float64)
    mask_array = np.array([mask],dtype=np.int64)
    vectors.append({'tokens': tokens, 'keys': keys, 'ngramLen': length, 'historySize': history_size,
                    'iv': str(iv), 'firstHash': str(bases[0]), 'firstGValues': values[0], 'mask': mask,
                    'valid': sum(mask), 'mean': float(mean_function(array.copy(),mask_array)[0]),
                    'weighted': float(weighted_function(array.copy(),mask_array)[0])})
Path('tests/fixtures/synthid-reference.json').write_text(json.dumps({
    'source': f'https://github.com/google-deepmind/synthid-text/tree/{commit}',
    'method': 'Pinned upstream accumulate_hash, get_gvals, mean_score and weighted_mean_score executed with NumPy array operations; mask follows the upstream zero-initialized history loop.',
    'vectors': vectors},indent=2)+'\n',encoding='utf8')

texts = ['', 'Hello world', 'Das ist ein Beispiel.', 'Äpfel und Öl – schön!', '😀 👨‍👩‍👧‍👦', 'A\u200BB\u2060C\u00ADD\u2063E', '  Leerraum\n\nZeile\tText ', "I'm testing GPT-2. Don't split incorrectly."]
gemma = spm.SentencePieceProcessor(model_file='assets/tokenizers/gemma.model')
gpt2 = tiktoken.get_encoding('r50k_base')
Path('tests/fixtures/tokenizers.json').write_text(json.dumps({
    'source': {'gpt2': 'tiktoken 0.14.0 r50k_base', 'gemma': 'sentencepiece 0.2.2, pinned Gemma model', 'gemmaBosId': gemma.bos_id(), 'gemmaVocabSize': gemma.vocab_size()},
    'vectors': [{'text': text, 'gpt2': gpt2.encode_ordinary(text), 'gemma': gemma.encode(text)} for text in texts]
},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Generated upstream-function and independent tokenizer fixtures.')
