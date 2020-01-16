# Upload Files

The Drive API allows you to upload file data when creating or updating a File resource.

## Upload options

The Drive API allows you to upload certain types of binary data, or media. The specific characteristics of the data you can upload are specified on the reference page for any method that supports media uploads:

- **Maximum upload file size**: The maximum amount of data you can store with this method.
- **Accepted media MIME types**: The types of binary data you can store using this method.

You can make upload requests in any of the following ways. Specify the method you are using with the uploadType request parameter.

Simple upload: uploadType=media. For quick transfer of smaller files, for example, 5 MB or less.
Multipart upload: uploadType=multipart. For quick transfer of smaller files and metadata; transfers the file along with metadata that describes it, all in a single request.
Resumable upload: uploadType=resumable. For reliable transfer, especially important with larger files. With this method, you use a session initiating request, which optionally can include metadata. This is a good strategy to use for most applications, since it also works for smaller files at the cost of one additional HTTP request per upload.
When you upload media, you use a special URI. In fact, methods that support media uploads have two URI endpoints:

- **The /upload URI, for the media**. The format of the upload endpoint is the standard resource URI with an `/upload` prefix. Use this URI when transferring the media data itself. Example: `POST /upload/drive/v2/files`.
- **The standard resource URI, for the metadata**. If the resource contains any data fields, those fields are used to store metadata describing the uploaded file. You can use this URI when creating or updating metadata values. Example: `POST /drive/v2/files`.


## Simple upload

The most straightforward method for uploading a file is by making a simple upload request. This option is a good choice when:

- The file is small enough to upload again in its entirety if the connection fails.
- There is no metadata to send. This might be true if you plan to send metadata for this resource in a separate request, or if no metadata is supported or available.


To use simple upload, make a `POST` or `PUT` request to the method's **/upload** URI and add the query parameter `uploadType=media`. For example:

```
POST https://www.googleapis.com/upload/drive/v2/files?uploadType=media
```

The HTTP headers to use when making a simple upload request include:

- `Content-Type`. Set to one of the method's accepted upload media data types, specified in the API reference.
- `Content-Length`. Set to the number of bytes you are uploading. Not required if you are using chunked transfer encoding.


### Example: Simple upload

The following example shows the use of a simple upload request for the Drive API.
```
POST /upload/drive/v2/files?uploadType=media HTTP/1.1
Host: www.googleapis.com
Content-Type: image/jpeg
Content-Length: number_of_bytes_in_file
Authorization: Bearer your_auth_token

JPEG data
```

If the request succeeds, the server returns the HTTP 200 OK status code along with any metadata:

```
HTTP/1.1 200
Content-Type: application/json

{
  "title": "My File"
}
```

### Multipart upload

If you have metadata that you want to send along with the data to upload, you can make a single multipart/related request. This is a good choice if the data you are sending is small enough to upload again in its entirety if the connection fails.

To use multipart upload, make a POST or PUT request to the method's **/upload** URI and add the query parameter `uploadType=multipart`, for example:
```
POST https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart
```

The top-level HTTP headers to use when making a multipart upload request include:

- `Content-Type`. Set to multipart/related and include the boundary string you're using to identify the parts of the request.
- `Content-Length`. Set to the total number of bytes in the request body. The media portion of the request must be less than the maximum file size specified for this method.

The body of the request is formatted as a multipart/related content type [RFC2387] and contains exactly two parts. The parts are identified by a boundary string, and the final boundary string is followed by two hyphens.

Each part of the multipart request needs an additional Content-Type header:

- **Metadata part**: Must come first, and Content-Type must match one of the accepted metadata formats.
- **Media part**: Must come second, and Content-Type must match one the method's accepted media MIME types.

See the API reference for each method's list of accepted media MIME types and size limits for uploaded files.


Note: To create or update the metadata portion only, without uploading the associated data, simply send a `POST` or `PUT` request to the standard resource endpoint: `https://www.googleapis.com/drive/v2/files`


#### Example: Multipart upload

The example below shows a multipart upload request for the Drive API.

```
POST /upload/drive/v2/files?uploadType=multipart HTTP/1.1
Host: www.googleapis.com
Authorization: Bearer your_auth_token
Content-Type: multipart/related; boundary=foo_bar_baz
Content-Length: number_of_bytes_in_entire_request_body

--foo_bar_baz
Content-Type: application/json; charset=UTF-8

{
  "title": "My File"
}

--foo_bar_baz
Content-Type: image/jpeg

JPEG data
--foo_bar_baz--
```

If the request succeeds, the server returns the HTTP 200 OK status code along with any metadata:
```
HTTP/1.1 200
Content-Type: application/json

{
  "title": "My File"
}
```

#### Resumable upload

To upload data files more reliably, you can use the resumable upload protocol. This protocol allows you to resume an upload operation after a communication failure has interrupted the flow of data. It is especially useful if you are transferring large files and the likelihood of a network interruption or some other transmission failure is high, for example, when uploading from a mobile client app. It can also reduce your bandwidth usage in the event of network failures because you don't have to restart large file uploads from the beginning.

The steps for using resumable upload include:

- Start a resumable session. Make an initial request to the upload URI that includes the metadata, if any.
- Save the resumable session URI. Save the session URI returned in the response of the initial request; you'll use it for the remaining requests in this session.
- Upload the file. Send the media file to the resumable session URI.

In addition, apps that use resumable upload need to have code to resume an interrupted upload. If an upload is interrupted, find out how much data was successfully received, and then resume the upload starting from that point.

Note: An upload URI expires after one week.


##### Step 1: Start a resumable session

To initiate a resumable upload, make a POST or PUT request to the method's */upload* URI and add the query parameter uploadType=resumable, for example:
```
POST https://www.googleapis.com/upload/drive/v2/files?uploadType=resumable
```

For this initiating request, the body is either empty or it contains the metadata only; you'll transfer the actual contents of the file you want to upload in subsequent requests.

Use the following HTTP headers with the initial request:

- `X-Upload-Content-Type`. Set to the media MIME type of the upload data to be transferred in subsequent requests.
- `X-Upload-Content-Length`. Set to the number of bytes of upload data to be transferred in subsequent requests.  If the length is unknown at the time of this request, you can omit this header.
- If providing metadata: `Content-Type`. Set according to the metadata's data type.
- `Content-Length`. Set to the number of bytes provided in the body of this initial request. Not required if you are using chunked transfer encoding.

See the API reference for each method's list of accepted media MIME types and size limits for uploaded files.

###### Example: Resumable session initiation request

The following example shows how to initiate a resumable session for the Drive API.

```
POST /upload/drive/v2/files?uploadType=resumable HTTP/1.1
Host: www.googleapis.com
Authorization: Bearer your_auth_token
Content-Length: 38
Content-Type: application/json; charset=UTF-8
X-Upload-Content-Type: image/jpeg
X-Upload-Content-Length: 2000000

{
  "title": "My File"
}
```

Note: For an initial resumable update request without metadata, leave the body of the request empty, and set the Content-Length header to 0.

The next section describes how to handle the response.

##### Step 2: Save the resumable session URI

If the session initiation request succeeds, the API server responds with a 200 OK HTTP status code. In addition, it provides a Location header that specifies your resumable session URI. The Location header, shown in the example below, includes an upload_id query parameter portion that gives the unique upload ID to use for this session.

###### Example: Resumable session initiation response

Here is the response to the request in Step 1:
```
HTTP/1.1 200 OK
Location: https://www.googleapis.com/upload/drive/v2/files?uploadType=resumable&upload_id=xa298sd_sdlkj2
Content-Length: 0
```
The value of the Location header, as shown in the above example response, is the session URI you'll use as the HTTP endpoint for doing the actual file upload or querying the upload status.

Copy and save the session URI so you can use it for subsequent requests.

##### Step 3: Upload the file

To upload the file, send a PUT request to the upload URI that you obtained in the previous step. The format of the upload request is:

```
PUT session_uri
```

The HTTP headers to use when making the resumable file upload requests includes Content-Length. Set this to the number of bytes you are uploading in this request, which is generally the upload file size.

###### Example: Resumable file upload request

Here is a resumable request to upload the entire 2,000,000 byte JPEG file for the current example.
```
PUT https://www.googleapis.com/upload/drive/v2/files?uploadType=resumable&upload_id=xa298sd_sdlkj2 HTTP/1.1
Content-Length: 2000000
Content-Type: image/jpeg

bytes 0-1999999
```

If the request succeeds, the server responds with an HTTP `201 Created`, along with any metadata associated with this resource. If the initial request of the resumable session had been a PUT, to update an existing resource, the success response would be `200 OK`, along with any metadata associated with this resource.

If the upload request is interrupted or if you receive an `HTTP 503 Service Unavailable` or any other `5xx` response from the server, follow the procedure outlined in resume an interrupted upload.  

###### Uploading the file in chunks

With resumable uploads, you can break a file into chunks and send a series of requests to upload each chunk in sequence. This is not the preferred approach since there are performance costs associated with the additional requests, and it is generally not needed. However, you might need to use chunking to reduce the amount of data transferred in any single request. This is helpful when there is a fixed time limit for individual requests, as is true for certain classes of Google App Engine requests. It also lets you do things like providing upload progress indications for legacy browsers that don't have upload progress support by default.

#### Resume an interrupted upload

If an upload request is terminated before receiving a response or if you receive an HTTP 503 Service Unavailable response from the server, then you need to resume the interrupted upload. To do this:

1) **Request status**. Query the current status of the upload by issuing an empty PUT request to the upload URI. For this request, the HTTP headers should include a Content-Range header indicating that the current position in the file is unknown.  For example, set the Content-Range to `*/2000000` if your total file length is 2,000,000. If you don't know the full size of the file, set the Content-Range to `*/*`.

Note: You can request the status between chunks, not just if the upload is interrupted. This is useful, for example, if you want to show upload progress indications for legacy browsers.
2) **Get number of bytes uploaded**. Process the response from the status query. The server uses the Range header in its response to specify which bytes it has received so far.  For example, a Range header of `0-299999` indicates that the first `300,000` bytes of the file have been received.
3) **Upload remaining data**. Finally, now that you know where to resume the request, send the remaining data or current chunk. Note that you need to treat the remaining data as a separate chunk in either case, so you need to send the Content-Range header when you resume the upload.

##### Example: Resuming an interrupted upload

###### Request the upload status.
The following request uses the Content-Range header to indicate that the current position in the 2,000,000 byte file is unknown.
```
PUT {session_uri} HTTP/1.1
Content-Length: 0
Content-Range: bytes */2000000
```

###### Extract the number of bytes uploaded so far from the response.
The server's response uses the Range header to indicate that it has received the first 43 bytes of the file so far. Use the upper value of the Range header to determine where to start the resumed upload.

```
HTTP/1.1 308 Resume Incomplete
Content-Length: 0
Range: 0-42
```

Note: It is possible that the status response could be 201 Created or 200 OK if the upload is complete. This could happen if the connection broke after all bytes were uploaded but before the client received a response from the server.

###### Resume the upload from the point where it left off.
The following request resumes the upload by sending the remaining bytes of the file, starting at byte 43.
```
PUT {session_uri} HTTP/1.1
Content-Length: 1999957
Content-Range: bytes 43-1999999/2000000

bytes 43-1999999
```
