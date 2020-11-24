<img src="https://s3-us-west-1.amazonaws.com/berkeleytime-static-prod/misc/illegal_bt_logo.png" height="250">

# Berkeleytime

A course discovery and planning tool which combines all of Berkeley's academic information in one place. We intend to make it a more accurate and powerful tool than anything students currently use.

Created by [Yuxin Zhu](http://yuxinzhu.com/) and Noah Gilmore

Maintained by the ASUC Office of the CTO


## Quick Start

This codebase is __not__ open source. Please do not distribute.

Please refer to the [wiki](https://github.com/asuc-octo/campanile/wiki) for all documentation and getting started.

## Development

Staging and production both build from the master branch. As such, please use the branches as follows:
- \<your branch name\>: feel free to do whatever you want on this branch
- \<feature branch name\>: finalize features here then merge to master when done
- **master: please only merge when your feature is complete and ready to be deployed**
- production: this branch is now deprecated and is no longer linked to our production site

To deploy to production, go into GitLab and click on the “deploy to production” button after staging.berkeleytime.com. Prod deployments can be rolled back by redeploying old commits of master branch. You can also view live versions of pull requests at \<branch name\>.berkeleytime.com.
