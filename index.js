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
    const path = decodeURIComponent(url.pathname).split("/"); // get pathname "pathname[1]" = https://cloudflare.com/path

    // Handle Hide URL Requests
    if (path[1] === "api" && path[2] === "hideUrl") {
      const key_url = url.searchParams.get("url"); // get key in '?url=Key'
      const key_method = (url.searchParams.get("method") || request.method).toUpperCase(); // get key in '?method=POST' otherwise get request method
      
      // Detect if Key Url is Missing
      if (!key_url) {
        return new Response(`400: Missing url parameter`, { status: 400 });
      }

      const json = JSON.stringify({ 
        URL: key_url,
        Method: key_method
      });
        
      return new Response(`${domain}/domain/${EncodeText(JSON.stringify(json), ServiceKey)}`, {
        headers: { "Content-Type": "text/plain" }
      });
    }

    // Handle Access Encoded Domains
    if (path[1] === "domain") {
      const data = DecodeText(path[2], ServiceKey);
      return new Response(data, {
        headers: { "Content-Type": "text/plain" }
      });
    }
    
    return new Response("404: Not Found", { status: 404 });
  }
}
