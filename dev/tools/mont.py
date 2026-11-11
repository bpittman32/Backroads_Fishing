import sys
from PIL import Image
d=sys.argv[1]; names=sys.argv[2].split(','); top=float(sys.argv[3]) if len(sys.argv)>3 else .2; bot=float(sys.argv[4]) if len(sys.argv)>4 else .85
ims=[]
for n in names:
  im=Image.open(f'{d}/{n}.png'); w,h=im.size; ims.append(im.crop((0,int(h*top),w,int(h*bot))).resize((w//2,int(h*(bot-top))//2)))
w,h=ims[0].size; cols=min(3,len(ims)); rows=(len(ims)+cols-1)//cols; M=Image.new('RGB',(w*cols,h*rows))
for i,im in enumerate(ims): M.paste(im,((i%cols)*w,(i//cols)*h))
M.save(f'{d}/montage.png')
