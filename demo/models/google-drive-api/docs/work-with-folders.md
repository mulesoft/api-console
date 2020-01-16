# Work with Folders

Much of the information you'll need to get started inserting and retrieving files and folders is detailed in the Files reference. Here are a few more important keys to working with the Drive API methods for folders:

- A folder is a file with the MIME type application/vnd.google-apps.folder and with no extension.
- You can use the alias root to refer to the root folder anywhere a file ID is provided

The rest of this page provides some details on important considerations for creating folders and inserting files in folders.

## Creating a folder

In the Drive API, a folder is essentially a file — one identified by the special folder MIME type `application/vnd.google-apps.folder`. You can create a new folder by inserting a file with this MIME type and a folder title. Do not include an extension when setting a folder title.

### Java
```
File fileMetadata = new File();
fileMetadata.setName("Invoices");
fileMetadata.setMimeType("application/vnd.google-apps.folder");

File file = driveService.files().create(fileMetadata)
        .setFields("id")
        .execute();
System.out.println("Folder ID: " + file.getId());
```

### Python
```
file_metadata = {
  'name' : 'Invoices',
  'mimeType' : 'application/vnd.google-apps.folder'
}
file = drive_service.files().create(body=file_metadata,
                                    fields='id').execute()
print 'Folder ID: %s' % file.get('id')
```

### PHP
```
$fileMetadata = new Google_Service_Drive_DriveFile(array(
  'name' => 'Invoices',
  'mimeType' => 'application/vnd.google-apps.folder'));
$file = $driveService->files->create($fileMetadata, array(
  'fields' => 'id'));
printf("Folder ID: %s\n", $file->id);
```
### .NET
```
var fileMetadata = new File();
fileMetadata.Name = "Invoices";
fileMetadata.MimeType = "application/vnd.google-apps.folder";
var request = driveService.Files.Create(fileMetadata);
request.Fields = "id";
var file = request.Execute();
Console.WriteLine("Folder ID: " + file.Id);
```
### Ruby
```
file_metadata = {
  name: 'Invoices',
  mime_type: 'application/vnd.google-apps.folder'
}
file = drive_service.create_file(file_metadata, fields: 'id')
puts "Folder Id: #{file.id}"
```
### Node.js
```
var fileMetadata = {
  'name' : 'Invoices',
  'mimeType' : 'application/vnd.google-apps.folder'
};
drive.files.create({
   resource: fileMetadata,
   fields: 'id'
}, function(err, file) {
  if(err) {
    // Handle error
    console.log(err);
  } else {
    console.log('Folder Id: ', file.id);
  }
});
```


## Inserting a file in a folder
To insert a file in a particular folder, specify the correct ID in the parents property of the file, as shown:


### Java
```
String folderId = "0BwwA4oUTeiV1TGRPeTVjaWRDY1E";
File fileMetadata = new File();
fileMetadata.setName("photo.jpg");
fileMetadata.setParents(Collections.singletonList(folderId));
java.io.File filePath = new java.io.File("files/photo.jpg");
FileContent mediaContent = new FileContent("image/jpeg", filePath);
File file = driveService.files().create(fileMetadata, mediaContent)
        .setFields("id, parents")
        .execute();
System.out.println("File ID: " + file.getId());
```

### Python
```
folder_id = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E'
file_metadata = {
  'name' : 'photo.jpg',
  'parents': [ folder_id ]
}
media = MediaFileUpload('files/photo.jpg',
                        mimetype='image/jpeg',
                        resumable=True)
file = drive_service.files().create(body=file_metadata,
                                    media_body=media,
                                    fields='id').execute()
print 'File ID: %s' % file.get('id')
```

### PHP
```
$folderId = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E';
$fileMetadata = new Google_Service_Drive_DriveFile(array(
  'name' => 'photo.jpg',
  'parents' => array($folderId)
));
$content = file_get_contents('files/photo.jpg');
$file = $driveService->files->create($fileMetadata, array(
  'data' => $content,
  'mimeType' => 'image/jpeg',
  'uploadType' => 'multipart',
  'fields' => 'id'));
printf("File ID: %s\n", $file->id);
```
### .NET
```
var folderId = "0BwwA4oUTeiV1TGRPeTVjaWRDY1E";
var fileMetadata = new File();
fileMetadata.Name = "photo.jpg";
fileMetadata.Parents = new List<string> { realFolderId };
FilesResource.CreateMediaUpload request;
using (var stream = new System.IO.FileStream("files/photo.jpg", 
    System.IO.FileMode.Open))
{
    request = driveService.Files.Create(
        fileMetadata, stream, "image/jpeg");
    request.Fields = "id";
    request.Upload();
}
var file = request.ResponseBody;
Console.WriteLine("File ID: " + file.Id);
```
### Ruby
```
folder_id = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E'
file_metadata = {
  name: 'photo.jpg',
  parents: [folder_id]
}
file = drive_service.create_file(file_metadata,
                                 fields: 'id',
                                 upload_source: 'files/photo.jpg',
                                 content_type: 'image/jpeg')
puts "File Id: #{file.id}"
```
### Node.js
```
var folderId = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E';
var fileMetadata = {
  'name': 'photo.jpg',
  parents: [ folderId ]
};
var media = {
  mimeType: 'image/jpeg',
  body: fs.createReadStream('files/photo.jpg')
};
drive.files.create({
   resource: fileMetadata,
   media: media,
   fields: 'id'
}, function(err, file) {
  if(err) {
    // Handle error
    console.log(err);
  } else {
    console.log('File Id: ', file.id);
  }
});
```

The `parents` property can be used when creating a folder as well to create a subfolder.

## Moving files between folders

To add or remove parents for an exiting file, use the `addParents` and `removeParents` query parameters on the `files.update` method.

Both parameters may be used to move a file from one folder to another, as shown:

### Java
```
String fileId = "1sTWaJ_j7PkjzaBWtNc3IzovK5hQf21FbOw9yLeeLPNQ";
String folderId = "0BwwA4oUTeiV1TGRPeTVjaWRDY1E";
// Retrieve the existing parents to remove
File file = driveService.files().get(fileId)
        .setFields("parents")
        .execute();
StringBuilder previousParents = new StringBuilder();
for(String parent: file.getParents()) {
    previousParents.append(parent);
    previousParents.append(',');
}
// Move the file to the new folder
file = driveService.files().update(fileId, null)
        .setAddParents(folderId)
        .setRemoveParents(previousParents.toString())
        .setFields("id, parents")
        .execute();
```

### Python
```
file_id = '1sTWaJ_j7PkjzaBWtNc3IzovK5hQf21FbOw9yLeeLPNQ'
folder_id = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E'
# Retrieve the existing parents to remove
file = drive_service.files().get(fileId=file_id,
                                 fields='parents').execute();
previous_parents = ",".join(file.get('parents'))
# Move the file to the new folder
file = drive_service.files().update(fileId=file_id,
                                    addParents=folder_id,
                                    removeParents=previous_parents,
                                    fields='id, parents').execute()
```

### PHP
```
$fileId = '1sTWaJ_j7PkjzaBWtNc3IzovK5hQf21FbOw9yLeeLPNQ';
$folderId = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E';
$emptyFileMetadata = new Google_Service_Drive_DriveFile();
// Retrieve the existing parents to remove
$file = $driveService->files->get($fileId, array('fields' => 'parents'));
$previousParents = join(',', $file->parents);
// Move the file to the new folder
$file = $driveService->files->update($fileId, $emptyFileMetadata, array(
  'addParents' => $folderId,
  'removeParents' => $previousParents,
  'fields' => 'id, parents'));
```
### .NET
```
var fileId = "1sTWaJ_j7PkjzaBWtNc3IzovK5hQf21FbOw9yLeeLPNQ";
var folderId = "0BwwA4oUTeiV1TGRPeTVjaWRDY1E";
// Retrieve the existing parents to remove
var getRequest = driveService.Files.Get(fileId);
getRequest.Fields = "parents";
var file = getRequest.Execute();
var previousParents = String.Join(",", file.Parents);
// Move the file to the new folder
var updateRequest = driveService.Files.Update(new File(), fileId);
updateRequest.Fields = "id, parents";
updateRequest.AddParents = folderId;
updateRequest.RemoveParents = previousParents;
file = updateRequest.Execute();
```
### Ruby
```
file_id = '1sTWaJ_j7PkjzaBWtNc3IzovK5hQf21FbOw9yLeeLPNQ'
folder_id = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E'
# Retrieve the existing parents to remove
file = drive_service.get_file(file_id,
                              fields: 'parents')
previous_parents = file.parents.join(',')
# Move the file to the new folder
file = drive_service.update_file(file_id,
                                 add_parents: folder_id,
                                 remove_parents: previous_parents,
                                 fields: 'id, parents')
```
### Node.js
```
fileId = '1sTWaJ_j7PkjzaBWtNc3IzovK5hQf21FbOw9yLeeLPNQ'
folderId = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E'
// Retrieve the existing parents to remove
drive.files.get({
  fileId: fileId,
  fields: 'parents'
}, function(err, file) {
  if (err) {
    // Handle error
    console.log(err);
  } else {
    // Move the file to the new folder
    var previousParents = file.parents.join(',');
    drive.files.update({
      fileId: fileId,
      addParents: folderId,
      removeParents: previousParents,
      fields: 'id, parents'
    }, function(err, file) {
      if(err) {
        // Handle error
      } else {
        // File moved.
      }
    });
  }
});
```