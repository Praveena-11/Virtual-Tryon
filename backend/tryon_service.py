import base64, io, os, traceback, tempfile, sys
from flask import Flask, request, jsonify
from PIL import Image

os.environ['HF_TOKEN'] = ""  
os.environ['HUGGING_FACE_HUB_TOKEN'] = os.environ['HF_TOKEN']
os.environ['HF_HOME'] = tempfile.gettempdir() + '/hf_cache_new'


try:
    from gradio_client import Client, handle_file
except ImportError:
    print("Run:  pip install gradio_client")
    sys.exit(1)

app     = Flask(__name__)
_client = None

def get_client():
    global _client
    if _client is None:
        print("Connecting to IDM-VTON...")
        _client = Client("yisol/IDM-VTON")
        print("Connected!")
    return _client

def dataurl_to_file(dataurl):
    _, b64 = dataurl.split(',', 1)
    img = Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGB')
    tmp = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
    img.save(tmp.name, 'JPEG', quality=95)
    tmp.close()
    return tmp.name

def file_to_dataurl(path):
    # path might be a string or dict
    if isinstance(path, dict):
        path = path.get('path') or path.get('url', '')
    if isinstance(path, str) and path.startswith('http'):
        import requests as r
        data = r.get(path, timeout=30).content
        return 'data:image/jpeg;base64,' + base64.b64encode(data).decode()
    with open(path, 'rb') as f:
        return 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode()

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/tryon', methods=['POST'])
def tryon():
    person_path = garment_path = None
    try:
        body    = request.get_json(force=True)
        person_path  = dataurl_to_file(body['person'])
        garment_path = dataurl_to_file(body['garment'])
        desc         = body.get('description', 'a shirt')

        print(f"Running try-on: {desc}")
        result = get_client().predict(
            dict={
                "background": handle_file(person_path),
                "layers": [],
                "composite": None
            },
            garm_img        = handle_file(garment_path),
            garment_des     = desc,
            is_checked      = True,
            is_checked_crop = False,
            denoise_steps   = 30,
            seed            = 42,
            api_name        = "/tryon"
        )
        print("Result:", str(result)[:200])

        out = result[0] if isinstance(result, (list, tuple)) else result
        return jsonify({'result': file_to_dataurl(out)})

    except Exception as e:
        traceback.print_exc()
        global _client
        _client = None
        return jsonify({'error': str(e)}), 500
    finally:
        for p in [person_path, garment_path]:
            try:
                if p: os.unlink(p)
            except: pass

if __name__ == '__main__':
    print("\n" + "="*45)
    print("  IDM-VTON Service → http://localhost:5001")
    print("="*45 + "\n")
    try: get_client()
    except Exception as e: print(f"Will connect on first request ({e})")
    app.run(host='0.0.0.0', port=5001, debug=False)