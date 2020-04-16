const React = require("react");
const PoemDisplay = require("./PoemDisplay");
const PoemForm = require("./PoemForm");

/* the main page for the index route of this app */
const RootComponent = function() {
  const [poem, setPoem] = React.useState([]);

  const sendTopic = async (topic) => {
    const response = await fetch('/poem/'+topic.value)
    .then(result => result.json())
    .then(lines => setPoem(poem.concat(lines)));
  }


  return (
    <div>
      <h1>Automatic Poem Generator</h1>
      <p>Enter a topic to get a line from the <a href="https://www.goodreads.com/quotes">Goodreads quote library</a>. Change the topic at any point.</p>
      <PoemForm onSent={sendTopic} />
      
      <PoemDisplay poem={poem} />
    </div>
  );
}

module.exports = RootComponent;