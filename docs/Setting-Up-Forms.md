## How Forms Work

Forms is a templated component. The frontent component has a unique name prop, which is the unique name of the form. Then frontend then makes a request to `/api/forms/config/<UniqueName>/` which returns a YAML configration file. The frontend builds the form component from what is described in that YAML.

If the form has a file upload component, each file added to the form is then uploaded right away to Google Drive (this is done before the form is submitted). It does this by calling the end point `/api/forms/upload/` with a POST request, which returns a public link to that uploaded file. 

When the form is submitted, the answers are verified against some home built verification schemes. If the schemes pass, then the form is submitted to `/api/forms/submit/` with a POST request.

## Form Configuration

Each form configuration is located in the repository at `berkeleytime/forms/configs`. Each config has the filename `UniqueName.yaml` where UniqueName is the unique name of that form. In the YAML file, there are two top level keys: `info` which containers form metadata and `questions` which is a list of questions.

To create a new form, follow these steps

1. Decide on a unique name for this form (lets say `TestForm`) and create the file `TestForm.yaml`. This unique name can only consist of numbers and letters - no spaces!
2. Decide on a public name (the title of the form shown to users) and an optional description
3. Navigate to the Berkeleytime drive and look for a folder named InternalSubmissionForms. Create a new spread sheet in that folder and grab the url of that spread sheet.
4. If this form allows for file uploads, also create a folder in InternalSubmissionForms. Note the name of the folder you created.
5. Share your form with **bt-backend-prod@berkeleytime-218606.iam.gserviceaccount.com** and **bt-backend-staging@berkeleytime-218606.iam.gserviceaccount.com**
6. Now add the info field to the config, which should look like this

```
info:
  unique_name: "TestForm"
  public_name: "A Test Form"
  description: "For Testing Use"
  googlesheet_link: "https://docs.google.com/spreadsheets/d/1WEy7XNrndAqOeQ6YHcQzUEuuqrp07xL-DpXf9Hs9m8A/edit#gid=0"
  drive_folder_name: "InitialTests"
```
The `description` and `drive_folder_name` can be ommitted if they are not used. If the description is very long, a [multiline string](https://stackoverflow.com/questions/3790454/how-do-i-break-a-string-over-multiple-lines/21699210) can be used for the description. 

6. Make sure you set up the frontend components appropriately. 

	* Create a new view in `frontend/src/views/Forms` that importants and uses `BTForm from '../../components/Form/Form.jsx'`. Pass the unique name as the `name` prop into that component. See the `TestForm` for an example.
	* Set up the route in `frontend/src/routes/routes.js` by importing your newly created view and setting up a path. Do this not at the end, but before the `/error` path.

   Now if you go to your new path, you should see the form with your title and description. If you don't see anything, it may require you to reload the backend server manually with `make down && make up`. 

7. Add to your configuation a `questions` attribute, which is a list of questions. 

## Creating Questions

Each question has a required `title` and an optional `description`. It has a required `type`, which identifies what kind of question this is. Type can be `short`, `long`, `mutliple_choice`, `multiple_select`, or `file`. A question can also have an optional `required`, which signifies if the question needs to be completed to submit the form. The default value if this field is omitted is false.

If the question is of type `short`, `long`, `mutliple_choice`, or `file`, an optional placeholder value can be specified. For `multiple_choice`, the placeholder is the first unselectable item. For the file, the placeholder is the text in the file selection box and it is **not optional**. 

If the question is of type `multiple_choice` or `multiple_select`, you must provide a list of choices like so

```
  - title: "Example Question"
    type: "multiple_choice"
    choices:
      - "Choice A"
      - "Choice B"
      - "Choice C"
```

If the question is of type `long` or `short`, you can perform some additional verification. One verification is the optional `format` attribute, which can have the values `email`, `date`, or `number`. It makes sure that whatever the user enters is correctly formatted. For date, it must be a date of the format MM/DD/YYYY after the year 1900. You can also specify `min` or `max`, which are integers that represent the min and max number of characters the input must have, inclusive. 
```
  - title: "Example Question"
    type: "long"
    min: 100 # at least 100 chars
    max: 500 # at most 500 chars
    format: email # must be an email
```

If the question is of type `file`, you can add an optional attribute `accept` which is a string of comma separate file extensions that the file upload will accept. File uploads are always limited to 10 MB max per file. For example, if you only want to accept photo media:

```
  - title: "Example Question"
    placeholder: "The placeholder is required for files."
    type: "file"
    accept: ".gif,.jpg,.jpeg,.png"
```

## Hooks

Hooks are Python functions that are called when the form is submitted. Then do useful things, like creating a GitHub issue when the bugs form is submitted or emailing users a copy of their responses (not complete). In fact, the only completed hook right now is the `auto_github_issue` hook. 


To create a hook, in the `info` attribute of each config add a `hooks` attribute. This `hooks` is a list of hooks, each of which has a `name` property. The name is the name of the funciton you want to invoke. Additionally you can add some configration to the hook which exist as additional attributes. All in all, a hook looks like

```
info:
  unique_name: "TestForm"
  public_name: "A Test Form"
  googlesheet_link: <your sheet link>
  hooks:
    - name: auto_github_issue
      title: "A New Issue"
```

### auto_github_issue

This hook creates a GitHub issue whenever a form is filled out. It requires either a `question` or `title` configuration to be set. If `title` is set (as in the previous example), the new issue is created with that static title. If `question` is set, then the issue is created with the user's response to the question. `question` is of the format `Question X` where `X` is a number starting at 1, representing the question number as they are listed in the `questions` list. 

For example, the bugs form has
```
  hooks:
    - name: auto_github_issue
      question: Question 2
```
because Question 2 refers to the question "What kind of bug is it?" which is what we use as the title.

### auto_notice

This hook sends an email to a BT member or interested party whenever a form is filled out. It requires either a `to` configuration to be set, which is the email of the person who is to receive the notice.

### auto_confirm

This hook sends an email to the user when they fill out a form. It questions a `question` to be set, which specifies which question contains the user's email as the value. `question` is set up in the same way as `auto_github_issue`.

### Creating New Hooks

Each hook function is of the format

	def some_function_name(response, hook_config)

where `response` is the python representation of your form response and `hook_config` is some configuration for the hook. Hook functions must be added to the `HOOKS` list to be registered.
