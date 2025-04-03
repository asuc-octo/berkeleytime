# Open Computing Facility
We work with [OCF](https://www.ocf.berkeley.edu/) to host the majority of Berkeleytime, with the rest at GCP

The point of contacts at OCF will be the current semester's site managers

Berkeleytime's OCF email address is berkeleytime@ocf.berkeley.edu

### The CLI way
For macOS users (first-time only):
```
brew install google-cloud-sdk
gcloud auth login
```

This prints Slack login information to STDOUT (minus sign for bash usually means output to stdout)
```
gsutil cp gs://berkeleytime-218606/secrets/ocf-slack -
```

### The non-CLI way
Note that the email you put in must be authorized to access Berkeleytime's project named "berkeleytime-218606" in Google Cloud Storage
[https://console.cloud.google.com/storage/browser/berkeleytime-218606/secrets?prefix=&project=berkeleytime-218606&authuser=YOUR-EMAIL-HERE](https://console.cloud.google.com/storage/browser/berkeleytime-218606/secrets?prefix=&project=berkeleytime-218606&authuser=octo.berkeleytime@asuc.org)

The credentials file is secrets/ocf-slack

It's fine to save credentials files temporarily, but please delete it afterwards, use the CLI way to get credentials, or have your own secure password manager to save it (not txt files on your Desktop or sticky notes)


For the sake of not weirding people out, if you contact OCF on their [Slack](fco.slack.com), set a temporary profile status with your info

![Screen Shot 2021-04-26 at 18 57 40](https://user-images.githubusercontent.com/22272118/116173736-f0930d00-a6c1-11eb-8c76-d3930f9a34c6.png)
![Screen Shot 2021-04-26 at 18 57 52](https://user-images.githubusercontent.com/22272118/116173740-f1c43a00-a6c1-11eb-977a-08af0058fb6a.png)