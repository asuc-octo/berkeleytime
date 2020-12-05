# [Stanfurdtime Frontend](http://berkeleytime.com/)

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

# Issues
- If custom module resolution using `tsconfig.json`'s `baseUrl` doesn't work in
  VSCode, try restarting VSCode.
