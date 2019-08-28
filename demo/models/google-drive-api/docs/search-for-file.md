# Search for Files

You can search or filter files with the `files.list` or `children.list` methods of the Drive API. These methods accept the `q` parameter which is a search query combining one or more search clauses. Each search clause is made up of three parts.

- **Field** Attribute of the file that is searched, e.g., the attribute `title` of the file.
- **Operator** Test that is performed on the data to provide a match, e.g., `contains`.
- **Value**  The content of the attribute that is tested, e.g. the title of the file `My cool document`.


Combine clauses with the conjunction `and`, and negate the query with `not`.

## Fields

Field | Value Type | Operators | Description
--- | --- | --- | ---
title | string | contains, =, != | Title of the file.
fullText | string | contains | Full text of the file including title, description, content, and indexable text.
mimeType | string | contains, =, !=	 | MIME type of the file.
modifiedDate | date | <=, <, =, !=, >, >= | Date of the last modification of the file.
lastViewedByMeDate | date | <=, <, =, !=, >, >= | Date that the user last viewed a file.
trashed | boolean | =, != | Whether the file is in the trash or not.
starred | boolean | =, != | Whether the file is starred or not.
parents | collection | in | Whether the parents collection contains the specified ID.
owners | collection | in | Users who own the file.
writers | collection | in | Users who have permission to modify the file.
readers | collection | in | Users who have permission to read the file.
sharedWithMe | boolean | =, != | Files that have been shared with the authorized user.
properties | collection | has | Custom file properties.

1) The contains operator only performs prefix matching for a title. For example, the title "HelloWorld" would match for title contains 'Hello' but not title contains 'World'.

2) The contains operator only performs matching on entire string tokens for fullText. For example, if the full text of a doc contains the string "HelloWorld" only the query fullText contains 'HelloWorld' returns a result. Queries such as fullText contains 'Hello' do not return results in this scenario.

3) The contains operator will match on an exact alphanumeric phrase if it is surrounded by double quotes. For example, if the fullText of a doc contains the string "Hello there world", then the query fullText contains '"Hello there"' will return a result, but the query fullText contains '"Hello world"' will not. Furthermore, since the search is alphanumeric, if the fullText of a doc contains the string "Hello_world", then the query fullText contains '"Hello world"' will return a result.

4) Fields of type date are not currently comparable to each other, only to constant dates.


## Value types

Value Type | Notes
--- | ---
String | Surround with single quotes `'`. Escape single quotes in queries with `\'`, e.g., `'Valentine\'s Day'`.
Boolean | `true` or `false`.
Date | [RFC 3339](http://tools.ietf.org/html/rfc3339) format, default timezone is UTC, e.g., `2012-06-04T12:00:00-08:00.`

## Operators

Operator | Notes
--- | ---
`contains` | The content of one string is present in the other.
`=` | The content of a string or boolean is equal to the other.
`!=` | The content of a string or boolean is not equal to the other.
`<` | A date is earlier than another.
`<=` | A date is earlier than or equal to another.
`>` | A date is later than another.
`>=` | A date is later than or equal to another.
`in` | An element is contained within a collection.
`and` | Return files that match both clauses.
`or` | Return files that match either clause.
`not` | Negates a search clause.
`has` | A collection contains an element matching the parameters.

For compound clauses, you can use parentheses to group clauses together. For example:

```
modifiedDate > '2012-06-04T12:00:00' and (mimeType contains 'image/' or mimeType contains 'video/')
```

This search returns all files with an image or video MIME type that were last modified after June 4, 2012. Because and and or operators are evaluated from left to right, without parentheses the above example would return only images modified after June 4, 2012, but would return all videos, even those before June 4, 2012.

### Examples

All examples on this page show the unencoded q parameter, where title = 'hello' is encoded as title+%3d+%27hello%27. Client libraries handle this encoding automatically.


Search for files with the title "hello"

```
title = 'hello'
```

Search for folders using the folder-specific MIME type

```
mimeType = 'application/vnd.google-apps.folder'
```

Search for files that are not folders

```
mimeType != 'application/vnd.google-apps.folder'
```

Search for files with a title containing the words "hello" and "goodbye"

```
title contains 'hello' and title contains 'goodbye'
```

Search for files with a title that does not contain the word "hello"

```
not title contains 'hello'
```

Search for files containing the word "hello" in the content

```
fullText contains 'hello'
```

Search for files not containing the word "hello" in the content

not fullText contains 'hello'
Search for files containing the exact phrase "hello world" in the content

```
fullText contains '"hello world"'
fullText contains '"hello_world"'
```

Search for files with a query containing the \ character (e.g., \authors)

```
fullText contains '\\authors'
```

Search for files writeable by the user "test@example.org"

```
'test@example.org' in writers
```

Search for the ID 1234567 in the parents collection. This finds all files and folders located directly in the folder whose ID is 1234567.

```
'1234567' in parents
```

Search for the alias ID appfolder in the parents collection. This finds all files and folders located directly under the Application Data folder.

```
'appfolder' in parents
```

Search for files writeable by the users "test@example.org" and "test2@example.org"

```
'test@example.org' in writers and 'test2@example.org' in writers
```

Search for files containing the text "important" which are in the trash

```
fullText contains 'important' and trashed = true
```

Search for files modified after June 4th 2012

```
modifiedDate > '2012-06-04T12:00:00'    // default time zone is UTC
modifiedDate > '2012-06-04T12:00:00-08:00'
```

Search for files shared with the authorized user with "hello" in the title

```
sharedWithMe and title contains 'hello'
```

Search for files with a custom file property named additionalID with the value 8e8aceg2af2ge72e78.

```
properties has { key='additionalID' and value='8e8aceg2af2ge72e78' and visibility='PRIVATE' }
```
