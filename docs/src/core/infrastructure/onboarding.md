# Onboarding

> [!WARNING]
> Running commands in the `hozer` machine can break production! Please continue with caution.

The production website is hosted on a machine supplied by [the OCF](https://www.ocf.berkeley.edu/). This machine will be referenced as `hozer` or `hozer-51` in these docs. Connecting to this machine to accomplish infra-related tasks requires SSH.

This guide assumes basic experience with SSH.

1. Please ensure your public SSH key has an identifying comment attached, such as your Berkeley email:
    ```sh
    ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAq8Lwls394thisIsNotARealKey ga@github.com
    ```
    You can directly modify your public key file at `~/.ssh/id_*.pub`, or you can use the following command:
    ```sh
    ssh-keygen -c -C "someone@berkeley.edu" -f ~/.ssh/id_*
    ```
    Note that `-f` takes in the path to your *private* key file, but only modifies the *public* key file.

2. Copy your SSH key to the `hozer` machine's `authorized_keys` file:
    ```
    ssh-copy-id root@hozer-51.ocf.berkeley.edu
    ```
    The SSH password can be found in the pinned messages of the \#backend staff channel in discord.

3. (Optional) Add `hozer-51` to your `~/.ssh/config` file:
    ```sh
    # Begin Berkeleytime hozer config
    Host hozer-??
        HostName %h.ocf.berkeley.edu
        User root
    # End Berkeleytime hozer config
    ```
    Now, you can quickly SSH into the remote machine from your terminal:
    ```sh
    ssh hozer-51
    # as opposed to root@hozer-51.ocf.berkeley.edu
    ```
