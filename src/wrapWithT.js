module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Wrap JSXText (like plain "Registration Details")
  root.find(j.JSXText).forEach((path) => {
    const text = path.node.value.trim();
    if (text && !text.startsWith("{t(")) {
      path.replace(
        j.jsxExpressionContainer(
          j.callExpression(j.identifier("t"), [j.literal(text)]),
        ),
      );
    }
  });

  return root.toSource({ quote: "double" });
};
