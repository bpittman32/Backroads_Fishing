import sys,glob
from PIL import Image
fs=sorted(glob.glob(sys.argv[1]));out=sys.argv[2];cols=int(sys.argv[3]) if len(sys.argv)>3 else 4
ims=[Image.open(f) for f in fs];w=max(i.size[0] for i in ims);h=max(i.size[1] for i in ims)
M=Image.new('RGB',(w*cols,h*((len(ims)+cols-1)//cols)),'white')
for k,i in enumerate(ims):M.paste(i,((k%cols)*w,(k//cols)*h))
M.save(out);print(len(ims),M.size)
