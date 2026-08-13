const isUnknown = (typeAnnotation) => typeAnnotation.type === "TSUnknownKeyword";

const isSchemaJson = (typeAnnotation) =>
  typeAnnotation.type === "TSTypeReference" &&
  typeAnnotation.typeName.type === "TSQualifiedName" &&
  typeAnnotation.typeName.left.type === "Identifier" &&
  typeAnnotation.typeName.left.name === "Schema" &&
  typeAnnotation.typeName.right.type === "Identifier" &&
  typeAnnotation.typeName.right.name === "Json";

const unwrapTransparentExpression = (expression) => {
  let current = expression;

  while (
    current.type === "ParenthesizedExpression" ||
    current.type === "TSNonNullExpression" ||
    current.type === "ChainExpression" ||
    ((current.type === "TSAsExpression" || current.type === "TSTypeAssertion") &&
      isUnknown(current.typeAnnotation))
  ) {
    current = current.expression;
  }

  return current;
};

const assertionVisitors = (visit) => ({
  TSAsExpression: visit,
  TSTypeAssertion: visit,
});

export const noUnvalidatedJsonParseCast = {
  meta: {
    type: "problem",
    docs: {
      description: "Require validation instead of concrete casts on global JSON.parse results",
    },
    messages: {
      validate:
        "Validate the JSON.parse result before assigning a concrete type; keep it unknown until decoded.",
    },
  },
  create(context) {
    const isGlobalJsonParse = (expression) => {
      const candidate = unwrapTransparentExpression(expression);

      if (candidate.type !== "CallExpression" || candidate.callee.type !== "MemberExpression") {
        return false;
      }

      const { object, property } = candidate.callee;
      const isParseProperty = candidate.callee.computed
        ? property.type === "Literal" && property.value === "parse"
        : property.type === "Identifier" && property.name === "parse";

      return (
        object.type === "Identifier" &&
        object.name === "JSON" &&
        context.sourceCode.isGlobalReference(object) &&
        isParseProperty
      );
    };

    return assertionVisitors((node) => {
      if (
        !isUnknown(node.typeAnnotation) &&
        !isSchemaJson(node.typeAnnotation) &&
        isGlobalJsonParse(node.expression)
      ) {
        context.report({ messageId: "validate", node });
      }
    });
  },
};

export const noCatchBindingCast = {
  meta: {
    type: "problem",
    docs: {
      description: "Require narrowing or decoding before concretely typing a caught value",
    },
    messages: {
      narrow:
        "Narrow or decode the caught value before assigning a concrete type; catch bindings are unknown.",
    },
  },
  create(context) {
    const resolvesToCatchBinding = (expression) => {
      const candidate = unwrapTransparentExpression(expression);
      if (candidate.type !== "Identifier") return false;

      for (
        let scope = context.sourceCode.getScope(candidate);
        scope !== null;
        scope = scope.upper
      ) {
        const reference = scope.references.find(({ identifier }) => identifier === candidate);
        if (reference !== undefined) {
          return reference.resolved?.defs.some(({ type }) => type === "CatchClause") ?? false;
        }
      }

      return false;
    };

    return assertionVisitors((node) => {
      if (!isUnknown(node.typeAnnotation) && resolvesToCatchBinding(node.expression)) {
        context.report({ messageId: "narrow", node });
      }
    });
  },
};

export default {
  meta: {
    name: "gentle-quality",
  },
  rules: {
    "no-catch-binding-cast": noCatchBindingCast,
    "no-unvalidated-json-parse-cast": noUnvalidatedJsonParseCast,
  },
};
