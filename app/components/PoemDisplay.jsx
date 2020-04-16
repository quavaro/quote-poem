const React = require("react");

module.exports = function(props) {
    const poem = props.poem || [];

    const lineElts = poem.map((line, i) => <li key={i}>{line}</li>);

    return (<ul>{lineElts}</ul>);
}