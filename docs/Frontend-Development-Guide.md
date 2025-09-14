Welcome to the guide for developing on the BerkeleyTime Frontend. As of Spring of 2019, the frontend has been moved off of Django templating and converted to an independently run React application. All files for the frontend can be found in the `berkeleytime/frontend` folder.

## Architecture Overview

### React

This React application was originally created using Facebook's `create-react-app`. The entry point into the app can be found in the `frontend/index.js` file under `src`. The url routes for each of our pages is in defined in [src/routes/app.js](https://github.com/asuc-octo/berkeleytime/blob/master/frontend/src/routes/app.js), which gets delivered to the React Router. The base component for each of the pages is in [src/views](https://github.com/asuc-octo/berkeleytime/tree/master/frontend/src/views). Any subcomponents for the pages is in [src/components](https://github.com/asuc-octo/berkeleytime/tree/master/frontend/src/components).

### GraphQL 

At the time of writing, the API is being moved to GraphQL. All GraphQL queries should be added in `frontend/src/graphql/<query type>/<query name>.graphql` so if I had a `query GetUser` it would be at `graphql/query/GetUser.graphql`. When the development server is running, it will automatically detect additions/edit/removals to all .graphql files and automagically generate Apollo queries. `query GetUser` would result in a `useGetUserQuery` hook automatically being generated in `src/graphql/graphql.ts`. Import the appropriate hook from this file to use the query. **Read through the Apollo GraphQL docs** before diving in if you're not familiar with GraphQL. It's not too long, and the documentation explains the concepts really well-- the key ideas that are new being the GraphQL cache and the 'declarative' method of fetching data. Some other things to note:

 - I strongly recommended to install the [Apollo Dev Tools](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm?hl=en-US) plugin for Chrome which will add a tab to your Chrome dev tools letting you interactively and easily make/test GraphlQL queries when on a Berkeleytime tab.
 - Write queries which will optimally hit the Apollo GraphQL cache.
   - Apollo GraphQL has a lot of very useful features to maximize usability and performance (e.g. optimistic mutations). Take a look at the React docs to see how to best take advantage of them.
 - Try very, very hard to use the declared fragments (graphql/fragments) to play nice with TypeScript
 - Install/Enable the ESLint, and GraphQL (graphql.vscode-graphql) plugins for VSCode to ensure you're handling nulls/undefineds correctly.
 - Don't forget to handle loading and error states!
 - Query data from as low in the component tree as is reasonable
 - Write hooks (graphql/hooks) to encapsulate behavior for complex GraphQL operations (e.g. ensuring the cache is updated after a query).

Now and then, backend will change the GraphQL schema. To deal with this run (in the frontend directory):

```bash
npx get-graphql-schema http://localhost:8080/api/graphql > schema.graphql
```

to get the latest version of the schema. After running this you may have to restart the development server so it picks up on the new schema.

### Styling

We use SCSS for our stylesheets, which makes CSS more modular and reusable. A quick overview can be found [here](https://sass-lang.com/guide). We don't really use the fancy stuff like extend/inheritance, mostly just variables and mixins for responsiveness. The SCSS is located under [src/assets/sass](https://github.com/asuc-octo/berkeleytime/tree/master/frontend/src/assets/sass), and all of it gets compiled into `berkeleytime.css`. `berkeleytime.scss` just imports all of the SCSS files we use, which are all in the `bt` folder.

## Pages

For details on each individual page, refer to one of the following pages (each subapplication can be found in the `frontend/views` folder):
* [Landing]()
* [About]()
* [Catalog]()
* [Grades]()
* [Enrollment]()
* [Scheduler]()
* [404]()
* [Dashboard]()

## Development Guide

### Version Control

You should make a new branch for a feature you are working on or a bug you are fixing, and then make a pull request when you are done. Feel free to review other open pull requests.

### Code Style

Currently our styling is pretty inconsistent and a lot of our code is undocumented, so moving forward we will strictly be adhering to styling guidelines to ensure readability and maintainability of the frontend codebase.

We will be enforcing styling using eslint, a style checking tool for JavaScript. You should be able to install an eslint tool in most text editors / IDEs. Unfortunately most of the codebase is not linted yet, but any new code you write should conform to our style. We don't have a linter for our SCSS yet but try to keep it clean and use 2 spaces as an indent. SCSS rules should begin with the view or subcomponent it is in, though be careful of existing bootstrap rules. If adding style along bootstrap rules, it should begin with `bt-`.

For React components, we should also start making PropTypes for any new components we make. Component functions that don't use `this` should be declared static (enforced by eslint). For component functions that use `this`, we will be using arrow functions to define them:

```
logInfo = number => {
  console.log(this.info);
  return number + 1;
}
```

This is because if we define functions the usual way, `function logInfo(number) { ...`, we have to add a line in the constructor to bind `this` to the function. If we use arrow functions, we don't have to worry about doing that. Unfortunately I haven't figured out how to make the linter recognize them yet, so arrow functions will currently cause an error in the linter (don't worry about it). All non-trivial functions you write should also have documentation using the [JSDoc](https://en.wikipedia.org/wiki/JSDoc) style. You don't need to document everything, probably a description, @params, and @return is good enough. A lot of the code is undocumented right now, so if you have any questions just ask!

### Structure

Currently we only really have a defined structure for the `src/views` folder for all our views, which is that every view sits in its own folder of the same name. Our components folder and SCSS is kind of all over the place right now, so any new files you create should conform to this structure. Lets say you are working on a view called `Recommendation`. Styling for the base component should live in `src/assets/scss/bt/views/` in a file of the same name. Any subcomponents solely for `Recommendations` should live in `src/components/Recommendations/`, and any styling for those subcomponents should live in `src/assets/scss/bt/components/Recommendations/` in a file of the same name as the subcomponent. Don't forget to `@import` any new SCSS files you create in `src/assets/berkeleytime.scss`, or else the styling won't be included! In the future, there will be `src/components/common` and `src/components/shared` for any common and shared components.

## Future Development
* Convert to React Hooks
* Redux & Typescript
