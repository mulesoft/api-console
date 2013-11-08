function fakeUriParameter(required) {
  if (required === undefined) {
    required = true;
  }

  return {
    type: 'string',
    required: required
  };
};
