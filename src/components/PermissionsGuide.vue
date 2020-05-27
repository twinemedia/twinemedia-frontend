<template>
    <div class="permissions">
        <h3>Permissions</h3>
            The following are all valid account permissions.
            Permissions are hierarchy-based, and as such, you may grant entire categories of permissions by using an asterisk instead of the next permission node.
            An example would be granting the permission <code>files.*</code> which would grant all file-related permissions. All permissions may be granted by simply granting <code>*</code>, but in that case, it would be more appropriate to set the account as an administrator.
            The differences between granting <code>*</code> and setting an account as an administrator is that administrators can create other accounts administrators, whereas <code>*</code>-granted accounts may not, as well as have the ability to delete accounts and edit other administrators' accounts.
            <br><br>
            <div class="permission">
                <p><b>upload</b></p>
                <p> - upload <i>Allows uploading files</i></p>
            </div>
            <div class="permission">
                <p><b>files</b></p>
                <p> - files.list <i>Allows listing and searching files</i></p>
                <p> - files.view <i>Allows viewing file info</i></p>
                <p> - files.edit <i>Allows editing file info</i></p>
                <p> - files.delete <i>Allows deleting files</i></p>
                <p> - files.child <i>Allows creating child media files</i></p>
            </div>
            <div class="permission">
                <p><b>tags</b></p>
                <p> - tags.list <i>Allows listing and searching tags</i></p>
                <p> - tags.info <i>Allows viewing tag info</i></p>
            </div>
            <div class="permission">
                <p><b>accounts</b></p>
                <p> - accounts.list <i>Allows listing and searching accounts</i></p>
                <p> - accounts.view <i>Allows viewing account info</i></p>
                <p> - accounts.edit <i>Allows editing account info and permissions</i></p>
                <p> - accounts.create <i>Allows creating new accounts</i></p>
            </div>
            <div class="permission">
                <p><b>lists</b></p>
                <p> - lists.list <i>Allows listing and searching lists</i></p>
                <p> - lists.view <i>Allows viewing lists and their contents</i></p>
                <p> - lists.edit <i>Allows editing list info</i></p>
                <p> - lists.add <i>Allows adding items to lists</i></p>
                <p> - lists.remove <i>Allows removing items from lists</i></p>
                <p> - lists.create <i>Allows creating new lists</i></p>
                <p> - lists.delete <i>Allows deleting lists</i></p>
            </div>
            <div class="permission">
                <p><b>processes</b></p>
                <p> - processes.list <i>Allows listing all process presets</i></p>
                <p> - processes.view <i>Allows viewing process preset settings</i></p>
                <p> - processes.edit <i>Allows editing process preset settings</i></p>
                <p> - processes.create <i>Allows creating new process presets</i></p>
                <p> - processes.delete <i>Allows deleting process presets</i></p>
            </div>
    </div>
</template>

<style scoped>
.permissions {
    padding: 10px;
    margin-left: 5%;
    margin-right: 5%;
    width: 90%;
    margin-top: 20px;
    border: 2px solid #3e8036;
    border-radius: 5px;
    text-align: left;
}
.permission b {
    border-bottom: 1px solid #3e8036;
}
</style>

<script>
export default {
    name: 'PermissionsGuide',
}
</script>