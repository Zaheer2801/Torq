const key = 'carapi_81102201eb834938b84247873859978e';

async function test() {
  try {
    const res = await fetch(`https://carapi.app/api/models?make=Acura`, {
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });
    const data = await res.text();
    console.log("Status:", res.status);
    console.log("Data:", data.substring(0, 500));
  } catch(e) {
    console.error(e);
  }
}

test();
