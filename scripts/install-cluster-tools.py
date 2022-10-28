#!/usr/bin/env python3
import hashlib,json,os,pathlib,platform,urllib.request,tempfile
root=pathlib.Path(__file__).resolve().parents[1]
platform_name={'Darwin':'darwin','Linux':'linux'}[platform.system()]
architecture={'arm64':'arm64','aarch64':'arm64','x86_64':'amd64'}[platform.machine()]
lock=json.loads((root/'infra/tools-lock.json').read_text());destination=root/'.tools';destination.mkdir(exist_ok=True)
for tool in ['kind','kubectl']:
    entry=lock[f'{tool}-{platform_name}-{architecture}'];target=destination/tool
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==entry['sha256']:
        print(f'{tool}: verified existing binary');continue
    data=urllib.request.urlopen(entry['url'],timeout=60).read()
    if hashlib.sha256(data).hexdigest()!=entry['sha256']:raise SystemExit(f'{tool}: checksum mismatch')
    with tempfile.NamedTemporaryFile(dir=destination,delete=False) as f:f.write(data);temporary=pathlib.Path(f.name)
    temporary.chmod(0o755);os.replace(temporary,target);print(f'{tool}: installed and verified')
