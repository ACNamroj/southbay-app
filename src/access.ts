export default (initialState: API.UserInfo) => {
  // Define the permissions used in the project here according to the initial data, for unified management
  // Reference documentation: https://umijs.org/docs/max/access
  const canSeeAdmin = !!(
    initialState && initialState.name !== 'dontHaveAccess'
  );
  return {
    canSeeAdmin,
  };
};
