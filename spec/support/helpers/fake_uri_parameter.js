function fakeUriParameter(required) {
  if (required === undefined) {
    required = true;
  }

  return {
    required: required
  };
};
