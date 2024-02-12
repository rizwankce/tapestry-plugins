// com.github.releases

function identify() {
  setIdentifier(null)
}

function load() {
  loadAsync()
    .then(processResults)
    .catch(processError)
}

async function loadAsync() {
  // Un authenticated request, rate limit is 60 requests per hour
  const repoUri = "https://api.github.com/repos/" + owner + "/" + repo
  const repoDetails = await sendRequest(repoUri)
  const repoDetailsJson = JSON.parse(repoDetails)

  let releaseUri = "https://github.com/" + owner + "/" + repo
  let creator = Creator.createWithUriName(releaseUri, owner + "/" + repo)
  creator.avatar = repoDetailsJson.owner.avatar_url

  const text = await sendRequest(repoUri+ "/releases")
  const json = JSON.parse(text);

  let results = []
  json.map (release => {
    let date = new Date(release.published_at)
    let uri = release.html_url
    var content = "<p>" + release.name + "<p>"
    content += "<p>Version: " + release.tag_name + "<p>"
    content += "<p>" + release.body + "<p"
    let post = Post.createWithUriDateContent(uri, date, content)
    post.creator = creator
    results.push(post)
  })

  return results
}
