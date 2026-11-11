import re,sys
s=open(sys.argv[1]).read()
s=re.sub(r'<!--DEV-->[\s\S]*?<!--/DEV-->\n?','',s)
s=re.sub(r'/\*DEV\*/[\s\S]*?/\*/DEV\*/\n?','',s)
open(sys.argv[2],'w').write(s)
print(s.count('DEV*/'),s.count('<!--DEV'),'devPanel' in s,'maxOut' in s,'DEV_BUILD' in s)
