# Onboarding

The production website is hosted on a remote machine supplied by [the OCF](https://www.ocf.berkeley.edu/). Connecting to this machine requires SSH.

This guide assumes basic experience with SSH.

> [!WARNING]
> Running commands in the `hozer` machine can break production! Continue with caution.

1. Copy your SSH key to the `hozer` machine's `authorized_keys` file:
    ```
    ssh-copy-id root@hozer-51.ocf.berkeley.edu
    ```
    The SSH password can be found in the pinned messages of the \#backend staff channel in discord.

> [!IMPORTANT]
> Please add an identifying comment to your public key! For example, your Berkeley email suffices. This helps significantly with key management.

2. (Optional) Add `hozer-51` to your `~/.ssh/config` file:
    ```bash
    # Begin Berkeleytime hozer config
    Host hozer-??
        HostName %h.ocf.berkeley.edu
        User root
    # End Berkeleytime hozer config
    ```
    Now, you can quickly SSH into the remote machine from your terminal:
    ```bash
    ssh hozer-51
    # as opposed to root@hozer-51.ocf.berkeley.edu
    ```
