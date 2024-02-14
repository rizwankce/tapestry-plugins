// com.hackernews

function load() {
  loadAsync().then(processResults).catch(processError);
}

async function loadAsync() {
  const text = await sendRequest(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
  );
  const topStories = JSON.parse(text).slice(0, 50); // 500 stories are returning for each request so limiting to 50
  let results = [];

  await Promise.all(
    topStories.map(async (id) => {
      const story = await getStoryById(id);
      let date = new Date(story.time * 1000);
      let postUri = "https://news.ycombinator.com/item?id=" + id;
      let content = "<p>" + story.title + "</p><p>" + story.url + "</p>";
      let post = Post.createWithUriDateContent(postUri, date, content);
      let creatorUri = "https://news.ycombinator.com/user?id=" + story.by;
      post.creator = Creator.createWithUriName(creatorUri, story.by);
      results.push(post);
    }),
  );
  return results;
}

async function getStoryById(id) {
  const storyText = await sendRequest(
    "https://hacker-news.firebaseio.com/v0/item/" + id + ".json",
  );
  return JSON.parse(storyText);
}
