# Introduction

> [!WARNING]
> The Berkeleytime Documentation is currently under construction.

Welcome to the Berkeleytime Docs! This is the primary documentation source for developers.

## Getting Started

> [!NOTE]
> The following are instructions to set up the documentation locally. To set up the Berkeleytime app locally, go to the [Local Development](./getting-started/local-development.md) section.

### Developing and Building Locally

There are two options: with and without containerization (ie. Docker).

#### With Containerization (Recommended)

Using Docker allows us to build the docs without downloading dependencies on our host machine, greatly simplifying the build process.

```sh
# ./berkeleytime
# Ensure you are on the latest commit
git pull

# Build the container (only needed once every time docs/Dockerfile changes!)
docker build --target=docs-dev --tag="docs:dev" --file="./apps/docs/Dockerfile" .

# Run the container
docker run --publish 3000:3000 --volume ./docs:/docs "docs:dev"
```

The docs should be available at `http://localhost:3000/` with live reload. To kill the container, you can use the Docker Desktop UI or run `docker kill [container id]`. You can find the container ID from `docker ps`.

> [!TIP]
> To change the port from the above `3000`, modify the `docker run` command as follows, replacing the `XXXX` with your desired port:
> ```sh
> docker run --publish XXXX:3000 --volume ./docs:/docs "docs:dev"
> ```

#### Without Containerization

To build and view the docs locally, `mdBook` must be installed by following the guide [here](https://rust-lang.github.io/mdBook/guide/installation.html#build-from-source-using-rust). It is necessary to install Rust locally as there are dependencies that are installed with `cargo`. Thus, it is highly recommended to [build mdbook from Rust](https://rust-lang.github.io/mdBook/guide/installation.html#build-from-source-using-rust).

```sh
# Install mdbook preprocessors with cargo
cargo install mdbook-alerts
cargo install mdbook-toc

# ./berkeleytime
# Ensure you are on the latest commit
git pull

# Navigate into the docs directory
cd docs

# Build the book and serve at http://localhost:3000/
mdbook serve --port=3000 --open
```

Changes in the markdown files will be shown live.

### Creating Books with Markdown and mdBook

As these docs are primarily written with markdown, feel free to check [this quick guide](https://www.markdownguide.org/basic-syntax/) on markdown's syntax.

To add new pages to the docs, check out the [`mdBook` guide](https://rust-lang.github.io/mdBook/guide/creating.html). Below is a step-by-step guide on creating a new page:

1. Create a new `.md` file in the `src` directory. For example, if you want your new page to be in the Infrastructure section, you should put the new file in `src/infrastructure`.

2. Add this file to `SUMMARY.md`. The indentation indicates which section your file will go under. For example:

    ```md
    - [Infrastructure](./infrastructure/README.md)
        - [My New File's Title](./infrastructure/my-new-file.md)
    ```

3. Add content to your file and see the results!
