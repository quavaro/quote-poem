const React = require('react');
const qs = require("qs");

/* the main page for the index route of this app */
const PoemForm = function(props) {

    const [value, setValue] = React.useState("");

    const handleChange = (event) => {
        setValue(event.target.value);
      }

      
      const handleSubmit = (event) => {
        if (props.onSent) props.onSent({value});
        event.preventDefault();
      }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Topic: 
                <input type="text" value={value} onChange={handleChange} />
            </label>
            <input type="submit" value="Get a line about this topic" id="sendTopic"/>
        </form>
    );
}

module.exports = PoemForm;