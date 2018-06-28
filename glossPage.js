fetch('https://cf-glossary.cfapps.io/words.json')
  .then(function(response) {
    return response.json();
  })
  .then(dictionary => {
    setInterval(() => { annotate(dictionary)}, 3000)
  });

function annotate(dictionary) {
  const textNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, null);

  const nodes = [];
  while (textNode = textNodes.nextNode()) {
    nodes.push(textNode);
  }

  nodes.forEach(node => annotateNode(node, dictionary));
}

const TEXT_NODE = 3;
let ANNOTATION_TAG_NAME = "p-annotation";

function annotateNode(node, dictionary) {
  let match = false;
  if (node.parentElement.tagName === ANNOTATION_TAG_NAME) {
    return;
  }

  const textContent = node.textContent;
  const replacementNodes = textContent.split(' ').reduce((nodes, word) => {
    const matchingEntry = dictionary[word.toLowerCase()];
    if (matchingEntry) {
      match = true;
      let lastNode = nodes[nodes.length-1];
      if (lastNode) {
        if(lastNode.nodeType === TEXT_NODE) {
          lastNode.textContent = lastNode.textContent + ' ';
        } else {
          nodes.push(document.createTextNode(' '));
        }
      }
      nodes.push(createAbbr(word, helpText(matchingEntry)));
    } else {
      let lastNode = nodes[nodes.length-1];
      if (lastNode && lastNode.nodeType === TEXT_NODE) {
        lastNode.textContent = lastNode.textContent + ' ' + word;
      } else if (lastNode) {
        nodes.push(document.createTextNode(' ' + word));
      }
      else {
        nodes.push(document.createTextNode(word));
      }
    }
    return nodes;
  }, []);

  if(match) {
    replaceNode(node, replacementNodes);
  }
}

function helpText(entry) {
  let expansion = entry.expansion;
  let definition = entry.definition;

  let helpTextParts = [];
  if (expansion) {
    helpTextParts.push(expansion);
  }

  if (definition) {
    helpTextParts.push(definition)
  }

  return helpTextParts.join('\n\n');
}

function createAbbr(acronym, expansion) {
  const span = document.createElement(ANNOTATION_TAG_NAME);
  span.setAttribute("title", expansion);
  span.textContent = acronym;
  return span;
}

function replaceNode(node, replacementNodes) {
  const parent = node.parentNode;

  replacementNodes.forEach(replacementNode => {
    parent.insertBefore(replacementNode, node);
  });

  parent.removeChild(node);
}
