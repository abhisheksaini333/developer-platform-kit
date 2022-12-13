#!/usr/bin/env python3
import pathlib,platform,json,subprocess,hashlib,tempfile,tarfile,shutil
root=pathlib.Path(__file__).resolve().parents[1];tools=root/'.tools';tools.mkdir(exist_ok=True);destination=tools/'dotnet'
lock=json.loads((root/'infra/dotnet-sdk-lock.json').read_text())
if destination.exists():
    actual=subprocess.check_output([str(destination/'dotnet'),'--version'],text=True,cwd=tools).strip()
    if actual!=lock['version']:raise SystemExit('Existing isolated SDK differs; preserve it and inspect manually')
    print('Existing isolated SDK reports '+actual);raise SystemExit(0)
os_name={'Darwin':'osx','Linux':'linux'}[platform.system()];arch={'arm64':'arm64','aarch64':'arm64','x86_64':'x64'}[platform.machine()];artifact=lock['artifacts'][os_name+'-'+arch]
archive=tools/'dotnet-sdk.tar.gz';subprocess.run(['curl','--fail','--location','--retry','3','--max-time','300','--output',str(archive),artifact['url']],check=True)
if hashlib.sha512(archive.read_bytes()).hexdigest()!=artifact['sha512']:raise SystemExit('SDK archive checksum mismatch')
with tarfile.open(archive) as tar:
    for member in tar.getmembers():
        p=pathlib.PurePosixPath(member.name)
        if p.is_absolute() or '..' in p.parts:raise SystemExit('Unsafe SDK archive path')
staging=pathlib.Path(tempfile.mkdtemp(prefix='.dotnet-',dir=tools))
try:
    subprocess.run(['tar','-xzf',str(archive),'-C',str(staging)],check=True)
    actual=subprocess.check_output([str(staging/'dotnet'),'--version'],text=True,cwd=tools).strip()
    if actual!=lock['version']:raise SystemExit('Unexpected SDK version')
    staging.rename(destination);archive.unlink();print('Installed checksum-verified SDK '+actual)
finally:
    if staging.exists():shutil.rmtree(staging)
