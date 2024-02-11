// com.apple.developer.system-status

function identify() {
  setIdentifier(null)
}

function load() {
  loadAsync()
    .then(processResults)
    .catch(processError)
}

async function loadAsync() {
  const text = await sendRequest("https://www.apple.com/support/systemstatus/data/developer/system_status_en_US.js?callback=jsonCallback")
  // Remove the function call to get just the JSON data
  const start = text.indexOf('(') + 1;
  const end = text.lastIndexOf(')');
  const jsonText = text.substring(start, end);

  const obj = JSON.parse(jsonText);

  let results = []
  obj.services.map(service => {
    let name = service.serviceName
    let redirectUrl = service.redirectUrl
    if (redirectUrl == null) {
      redirectUrl = "https://www.apple.com/support/systemstatus/";
    }
    service.events.forEach(event => {
      if (event.eventStatus != "resolved" && event.eventStatus != "completed") {
      let date = new Date(event.epochStartDate)
      var content = "<p>Service Name: "+name+"</p>";
		  content += "<p>Message: "+event.message+"</p>";
      content += "<p>Affected Users: "+ event.usersAffected + "</p>";
      if (event.affectedServices != null && event.affectedServices.length > 0) {
        content += "<p>Affected Services: \n"+ event.affectedServices.map(a => { return a+"\n"}) + "</p>";
      }
      content += "<p>Status: "+ event.eventStatus + "</p>";
      let post = Post.createWithUriDateContent(redirectUrl, date, content)
      const creator = Creator.createWithUriName("https://developer.apple.com/system-status/", name)
      creator.avatar = "https://www.apple.com/newsroom/images/default/apple-logo-og.jpg"
      post.creator = creator
      results.push(post)
      }
    })
  })
  return results
}
