async function test() {
  try {
    const url = 'https://mobile.yangkeduo.com/goods.html?ps=c3mGUqgz7l';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      }
    });
    const html = await res.text();
    console.log(html.substring(0, 500));
    
    // Check for OG tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    console.log("Title:", titleMatch ? titleMatch[1] : "Not found");
    console.log("Image:", imageMatch ? imageMatch[1] : "Not found");
  } catch(e) {
    console.error(e);
  }
}
test();
