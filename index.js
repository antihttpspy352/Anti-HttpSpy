const ServiceKey = "alwj-29gs-QdG1-km3j-82ns-1wil-russ-1ov3";

//-- Encode/Decode Message with Key Function
const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function toBase32(bytes) {
  let bits = 0, value = 0, output = '';
  for (let byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += base32Alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += base32Alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

function fromBase32(str) {
  let bits = 0, value = 0, output = [];
  for (let c of str.toUpperCase()) {
    const index = base32Alphabet.indexOf(c);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

function EncodeText(text, key) {
  const data = new TextEncoder().encode(text);
  const keyData = new TextEncoder().encode(key);
  const encrypted = data.map((b, i) => b ^ keyData[i % keyData.length]);
  return toBase32(encrypted);
}

function DecodeText(encoded, key) {
  const data = fromBase32(encoded);
  const keyData = new TextEncoder().encode(key);
  const decrypted = data.map((b, i) => b ^ keyData[i % keyData.length]);
  return new TextDecoder().decode(new Uint8Array(decrypted));
}
//--


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const domain = url.origin; // get service full link
    const userAgent = request.headers.get('User-Agent') || ''; // get User-Agent    
    const pathname = decodeURIComponent(url.pathname.slice(1)); // remove leading '/'
    const auth = url.searchParams.get("auth"); // get key in '?auth=Key'

    // Detect if request UserAgent is not include "Roblox"
    if (!userAgent.includes('Roblox')) {
      return new Response('404: Not Found', { status: 403 });
    }

    let links = {};
    try {
      const jsonUrl = ScriptsLink;
      const response = await fetch(jsonUrl);
      if (!response.ok) throw new Error('Non-200 response');
      links = await response.json();
    } catch (e) {
      return new Response("Failed to fetch JSON.", { status: 500 });
    }

    // Handle Access Scripts
    if (pathname && auth) {
      const key = pathname;
      const linkData = links[key];
      const data = JSON.parse(DecodeText(auth, ServiceKey));
      
      if (!linkData) {
        return new Response(`404: Not Found`, { status: 404 });
      }

      // Detect if data decoded error
      if (!data || typeof data !== 'object' || !('Expiration' in data)) {
         return new Response(`404: Not Found`, { status: 404 });
      }
      
      // Detect if Access ID is Expired
      if (data.Expiration < Date.now()) {
         return new Response(`404: Not Found`, { status: 404 });
      }
      
      const resp = await fetch(linkData);
      if (!resp.ok) {
        return new Response(`${resp.status}: Failed to fetch content`, { status: 500 });
      }

      const decodedStr = GetRandomString(4);
      const fnStr = GetRandomString(5);
      const objStr = GetRandomString(18);
      const enfcStr = GetRandomString(10);
      const fnctblStr = GetRandomString(9);
        
      const textContent = await resp.text();
      const content = `${enfcStr} = true\ngame:GetService("ReplicatedStorage"):WaitForChild("${data.Name}").Value = tostring(math.random(1000000, 10000000))\n${textContent}`;
      const encoded = EncodeScript(content, String(data.Key));
      const script = `local ${fnctblStr} = {rconsoleprint,print,warn,error,setclipboard,writefile,appendfile,delfile,readfile,isfile,isfolder,listfiles,getcustomasset,rconsoleerr,rconsolewarn,makefolder} ${enfcStr} = false for i, v in next, ${fnctblStr} do local old old = hookfunction(v, function(...) if not ${enfcStr} then local args = {...} for i, arg in next, args do if tostring(i):find("${enfcStr}") or tostring(arg):find("${enfcStr}") then game.Players.LocalPlayer:Kick("Hook Detected!") return nil end end end return old(...) end) end local a = game local b = "GetService" local c = "ReplicatedStorage" local d = "Destroy" local ${objStr} = a[b](a, c)["${data.Name}"].Value local ${fnStr}="";for _, c in ipairs({${GetNumberWithMath(108)}, ${GetNumberWithMath(111)}, ${GetNumberWithMath(97)}, ${GetNumberWithMath(100)}, ${GetNumberWithMath(115)}, ${GetNumberWithMath(116)}, ${GetNumberWithMath(114)}, ${GetNumberWithMath(105)}, ${GetNumberWithMath(110)}, ${GetNumberWithMath(103)}}) do ${fnStr}=${fnStr}..string.char(c);end(getfenv()[${fnStr}] or _G[${fnStr}] or _ENV and _ENV[${fnStr}])((function(str, key) local function ${decodedStr}(encodedStr, key) local result = {} local parts = string.split(encodedStr, "/") for i = 1, #parts do local byte = tonumber(parts[i]) local k = key:byte(((i - 1) % #key) + 1) local decoded = (byte - k + 256) % 256 table.insert(result, string.char(decoded)) end return table.concat(result) end  return ${decodedStr}(str, key) end)("${encoded}", ${objStr}))()`;
      
      return new Response(script, {
        headers: { "Content-Type": "text/plain" }
      });
    }

    // Authorize Specific Key
    if (pathname) {
      const key = pathname;
      const linkData = links[key];

      if (!linkData) {
        return new Response(`404: Not Found`, { status: 404 });
      }

      const randomName = GetRandomName();
      const secureKey = generateSecureKey();
      const json = JSON.stringify({Key: secureKey, Name: randomName, Expiration: Date.now() + 1500});
      const enfcStr = GetRandomString(10);
      const fnctblStr = GetRandomString(9);
      const antihookcode = `local ${fnctblStr} = {rconsoleprint,print,warn,error,setclipboard,writefile,appendfile,delfile,readfile,isfile,isfolder,listfiles,getcustomasset,rconsoleerr,rconsolewarn,makefolder} local ${enfcStr} = false for i, v in next, ${fnctblStr} do local old old = hookfunction(v, function(...) if not ${enfcStr} then local args = {...} for i, arg in next, args do if tostring(i):find("${fnctblStr}") or tostring(arg):find("${fnctblStr}") then game.Players.LocalPlayer:Kick("Hook Detected!") return nil end end end return old(...) end) end`;
      const code = `loadstring("\\${encodeAscii(`local t={[1]=Instance,[2]="new",[3]="StringValue",[4]=game,[5]="GetService",[6]="ReplicatedStorage",[7]="Parent",[8]="Name",[9]="Archivable",[10]="Value",[11]=true,[12]="${secureKey}",[13]="${randomName}"} local v=t[1][t[2]](t[3])v[t[7]]=t[4][t[5]](t[4], t[6])v[t[8]]=t[13]v[t[9]]=t[11]v[t[10]]=t[12] ${antihookcode} loadstring(game:HttpGet("${domain}/${url.pathname.slice(1)}?auth=${EncodeText(json, ServiceKey)}"))() ${enfcStr} = true`)}")()`;

      return new Response(code, {
        headers: { "Content-Type": "text/plain" }
      });
    }

    return new Response("404: Not Found", { status: 404 });
  }
}
