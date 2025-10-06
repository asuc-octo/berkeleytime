## Updating API

The API page is backed by [Swagger](https://swagger.io/tools/swagger-ui/) and is shown at [berkeleytime.com/apidocs](https://berkeleytime.com/apidocs). It works by having the component fetch a YAML file from the frontend server, which is read and fed into Swagger. This file is located at in the repository at `frontend/public/assets/swagger.yaml`.


There is an example of the Swagger configuration format [here](https://editor.swagger.io) but also you can look at how the current APIs are set up. Essentially `paths` defines a dictionary of methods, each with a key like `/api/catalog/catalog_json/`. The value is a dictionary that is the configuration of that method. 


If you modify the return of a method or add a new method, you must change the schemas aka models. This is a structured representation of what the method will return. Berkeleytime returns JSON responses, so the model is formatted as a dictionary. Each field of a model either defines the type of the field along with an example value, or points to another model that is nested. 

**Note**: If you updated the API, make sure to increase the version number and announce it in releases.


## Updating Members

The members are split into CurrentMembers and PastMembers. To modify the current members, see the file `frontend/src/Contributors/CurrentContributors.jsx`.

The past members are served from a YAML and then templated by React. The YAML is located at in the repository at `frontend/public/assets/members.yaml`. It has a single key `past` which points to a list of groups. Each group represents a class, such as the Class of 2020, or a group of people like the Founding Team or Founders. The group has a `name` attribute and a `rows` attribute.

Each `rows` points to a 2D array (that is, a list of lists). This is because the website expects you to format `rows` as a table, where the outer lists represents each row on the site and the inner list represents each column or item in that row. Note that our convention is 4 members per row, so each row should point to a list of 4 items. Like so

```
  - name: Example Class
    rows:
      - - name: Person 1, Row 1
          role: Backend Lead
        - name: Person 2, Row 1
          role: Backend Engineer
        - name: Person 3, Row 1
          role: Advisor
        - name: Person 4, Row 1
          role: Backend Engineer
      - - name: Person 1, Row 2
          role: Frontend Lead
        - name: Person 2, Row 2
          role: Frontend Lead / PM

```

Each member is defined by a `name`, `role`, and optionally `site`. Technically `role` is optional as well, but it looks better to have it. 


## Updating Releases

The releases are served from a YAML and then templated by React. The YAML is located at in the repository at `frontend/public/assets/releases.yaml`. It has a single key `releases` which points to a list of release objects. Each release object has a `date` which is its title. It has two additional optional keys: `whatsNew` and `fixes`. Each points to a list of strings, which are the releases notes. 

You should **always** update the releases page every time you push to production. Consider batching multiple bug fixes into one release if they're not urgent. 
