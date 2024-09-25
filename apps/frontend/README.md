# [Berkeleytime Frontend](http://berkeleytime.com/)

# Structure

```
src/
  assets/        - scss, images, svgs
  bt/            - widely imported modules
  components/    - react components
  redux/
  views/
```

# Common Practices

- For simple structural margin and padding, try to use bootstrap's `m` and `p` classes
  for simplicity, either in the `className` prop or `@extend` the class in scss.
  ([doc](https://getbootstrap.com/docs/4.5/utilities/spacing/#notation))

# Important Scripts

- `npm run lint`: Outputs ESLint warnings
- `npm run analyze`: Analyzes bundle size

# Recommended VSCode Plugins

- [VSCode GraphQL](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

# Issues

- If custom module resolution using `tsconfig.json`'s `baseUrl` doesn't work in
  VSCode, try restarting VSCode.
