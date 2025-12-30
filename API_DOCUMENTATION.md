# API Documentation

This document outlines the RESTful APIs identified within the FreePBX project. The APIs are organized by module.

## Authentication
Most APIs require authentication. FreePBX typically uses OAuth2 for API authentication. Ensure you have obtained a valid access token.

**Header:**
`Authorization: Bearer <access_token>`

---

## Module: Core

### Users
*   **List Users**
    *   **Method:** `GET`
    *   **URI:** `/core/users`
    *   **Description:** Retrieves a list of all users.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/core/users" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get User**
    *   **Method:** `GET`
    *   **URI:** `/core/users/{id}`
    *   **Description:** Retrieves details for a specific user.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/core/users/100" \
             -H "Authorization: Bearer <access_token>"
        ```

---

## Module: Calendar

### Calendars
*   **List Calendars**
    *   **Method:** `GET`
    *   **URI:** `/calendar/`
    *   **Description:** Retrieves a list of all calendars.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/calendar/" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Calendar**
    *   **Method:** `GET`
    *   **URI:** `/calendar/{id}`
    *   **Description:** Retrieves details of a specific calendar.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/calendar/1" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update Calendar**
    *   **Method:** `PUT`
    *   **URI:** `/calendar/{id}`
    *   **Description:** Updates a specific calendar.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/calendar/1" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"name": "New Name", "description": "Updated Description"}'
        ```

### Events
*   **Get Events**
    *   **Method:** `GET`
    *   **URI:** `/calendar/events/{id}`
    *   **Description:** Retrieves events for a specific calendar.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/calendar/events/1" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update Event**
    *   **Method:** `PUT`
    *   **URI:** `/calendar/events/{id}`
    *   **Description:** Adds or updates an event in a calendar.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/calendar/events/1" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"eventid": "new", "start": "2023-10-27 10:00:00", "end": "2023-10-27 11:00:00", "description": "Meeting"}'
        ```

---

## Module: Conferences

### Conferences
*   **List Conferences**
    *   **Method:** `GET`
    *   **URI:** `/conferences/`
    *   **Description:** Retrieves a list of all conferences.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/conferences/" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Conference**
    *   **Method:** `GET`
    *   **URI:** `/conferences/{id}`
    *   **Description:** Retrieves details of a specific conference.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/conferences/101" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Delete Conference**
    *   **Method:** `DELETE`
    *   **URI:** `/conferences/{id}`
    *   **Description:** Deletes a specific conference.
    *   **cURL:**
        ```bash
        curl -X DELETE "http://<your-server>/admin/api/rest/conferences/101" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Create/Update Conference**
    *   **Method:** `PUT`
    *   **URI:** `/conferences/{id}`
    *   **Description:** Creates or updates a conference room.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/conferences/101" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"name": "Team Meeting", "userpin": "1234", "adminpin": "5678"}'
        ```

---

## Module: Contact Manager

### Groups
*   **List Groups**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/groups`
    *   **Description:** Retrieves all contact manager groups.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/contactmanager/groups" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **List Groups by Owner**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/groups/{id}`
    *   **Description:** Retrieves contact manager groups for a specific owner ID.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/contactmanager/groups/1" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Group Info**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/groups/{id}/{groupid}`
    *   **Description:** Retrieves details of a specific group for a specific owner.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/contactmanager/groups/1/5" \
             -H "Authorization: Bearer <access_token>"
        ```

### Entries
*   **List Entries**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/groups/{id}/{groupid}/entries`
    *   **Description:** Retrieves entries for a specific group.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/contactmanager/groups/1/5/entries" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Entry**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/entries/{id}`
    *   **Description:** Retrieves details of a specific contact entry.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/contactmanager/entries/10" \
             -H "Authorization: Bearer <access_token>"
        ```

---

## Module: Fax

### Settings
*   **Get Settings**
    *   **Method:** `GET`
    *   **URI:** `/fax/`
    *   **Description:** Retrieves global fax settings.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/fax/" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Detect Fax**
    *   **Method:** `GET`
    *   **URI:** `/fax/detect`
    *   **Description:** Lists fax detection modules.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/fax/detect" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update Settings**
    *   **Method:** `POST`
    *   **URI:** `/fax/`
    *   **Description:** Updates global fax settings.
    *   **cURL:**
        ```bash
        curl -X POST "http://<your-server>/admin/api/rest/fax/" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"key": "value"}'
        ```

### Fax Users
*   **List User Settings**
    *   **Method:** `GET`
    *   **URI:** `/fax/users`
    *   **Description:** Retrieves fax settings for all users.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/fax/users" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get User Settings**
    *   **Method:** `GET`
    *   **URI:** `/fax/users/{id}`
    *   **Description:** Retrieves fax settings for a specific user.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/fax/users/100" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update User Settings**
    *   **Method:** `POST`
    *   **URI:** `/fax/users/{id}`
    *   **Description:** Updates fax settings for a specific user.
    *   **cURL:**
        ```bash
        curl -X POST "http://<your-server>/admin/api/rest/fax/users/100" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"faxenabled": "true", "faxemail": "user@example.com"}'
        ```

---

## Module: Find Me / Follow Me

### Users
*   **List All User Settings**
    *   **Method:** `GET`
    *   **URI:** `/findmefollow/users`
    *   **Description:** Retrieves Find Me/Follow Me settings for all users.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/findmefollow/users" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get User Settings**
    *   **Method:** `GET`
    *   **URI:** `/findmefollow/users/{id}`
    *   **Description:** Retrieves Find Me/Follow Me settings for a specific user.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/findmefollow/users/100" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update User Settings**
    *   **Method:** `PUT`
    *   **URI:** `/findmefollow/users/{id}`
    *   **Description:** Updates Find Me/Follow Me settings for a specific user.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/findmefollow/users/100" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"strategy": "ringallv2", "grptime": "20", "grplist": "100"}'
        ```

---

## Module: Hotel Wakeup

### Wakeup Calls
*   **Get Code**
    *   **Method:** `GET`
    *   **URI:** `/hotelwakeup/code`
    *   **Description:** Retrieves the hotel wakeup code.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/hotelwakeup/code" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Languages**
    *   **Method:** `GET`
    *   **URI:** `/hotelwakeup/languages`
    *   **Description:** Retrieves list of installed languages for wakeup calls.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/hotelwakeup/languages" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **List Wakeup Calls**
    *   **Method:** `GET`
    *   **URI:** `/hotelwakeup/wakeup`
    *   **Description:** Retrieves all scheduled wakeup calls.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/hotelwakeup/wakeup" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Wakeup Call**
    *   **Method:** `GET`
    *   **URI:** `/hotelwakeup/wakeup/{id}/{ext}`
    *   **Description:** Retrieves a specific wakeup call.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/hotelwakeup/wakeup/1/100" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Create Wakeup Call**
    *   **Method:** `POST`
    *   **URI:** `/hotelwakeup/wakeup`
    *   **Description:** Schedules a new wakeup call.
    *   **cURL:**
        ```bash
        curl -X POST "http://<your-server>/admin/api/rest/hotelwakeup/wakeup" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"day": "2023-10-27", "time": "07:00", "destination": "100"}'
        ```

*   **Delete Wakeup Call**
    *   **Method:** `DELETE`
    *   **URI:** `/hotelwakeup/wakeup/{id}/{ext}`
    *   **Description:** Deletes a specific wakeup call.
    *   **cURL:**
        ```bash
        curl -X DELETE "http://<your-server>/admin/api/rest/hotelwakeup/wakeup/1/100" \
             -H "Authorization: Bearer <access_token>"
        ```

---

## Module: Parking

### Parking Lot
*   **Get Default Lot**
    *   **Method:** `GET`
    *   **URI:** `/parking/`
    *   **Description:** Retrieves the default parking lot settings.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/parking/" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update Default Lot**
    *   **Method:** `PUT`
    *   **URI:** `/parking/`
    *   **Description:** Updates the default parking lot settings.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/parking/" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"slots": "71-79"}'
        ```

---

## Module: Pinsets

### Pinsets
*   **List Pinsets**
    *   **Method:** `GET`
    *   **URI:** `/pinsets/`
    *   **Description:** Retrieves a list of all pinsets.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/pinsets/" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Pinset**
    *   **Method:** `GET`
    *   **URI:** `/pinsets/{id}`
    *   **Description:** Retrieves details of a specific pinset.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/pinsets/1" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update Pinset**
    *   **Method:** `PUT`
    *   **URI:** `/pinsets/{id}`
    *   **Description:** Updates a specific pinset.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/pinsets/1" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"description": "Sales", "passwords": "1234\n5678"}'
        ```

---

## Module: Presence State

### Presence
*   **List States**
    *   **Method:** `GET`
    *   **URI:** `/presencestate/list`
    *   **Description:** Retrieves a list of presence states.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/presencestate/list" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **List Types**
    *   **Method:** `GET`
    *   **URI:** `/presencestate/types`
    *   **Description:** Retrieves a list of presence state types.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/presencestate/types" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get User Preferences**
    *   **Method:** `GET`
    *   **URI:** `/presencestate/prefs/{extension}`
    *   **Description:** Retrieves presence state preferences for a user.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/presencestate/prefs/100" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update User Preferences**
    *   **Method:** `PUT`
    *   **URI:** `/presencestate/prefs/{extension}`
    *   **Description:** Updates presence state preferences for a user.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/presencestate/prefs/100" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"state": "available"}'
        ```

---

## Module: Queues

### Queues
*   **List Queues**
    *   **Method:** `GET`
    *   **URI:** `/queues/`
    *   **Description:** Retrieves a list of all queues.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/queues/" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Queue Details**
    *   **Method:** `GET`
    *   **URI:** `/queues/{id}`
    *   **Description:** Retrieves details of a specific queue.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/queues/500" \
             -H "Authorization: Bearer <access_token>"
        ```

### Queue Members
*   **List All Members**
    *   **Method:** `GET`
    *   **URI:** `/queues/members`
    *   **Description:** Retrieves all members for all queues.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/queues/members" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Queue Members**
    *   **Method:** `GET`
    *   **URI:** `/queues/members/{id}`
    *   **Description:** Retrieves members of a specific queue.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/queues/members/500" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update Queue Members**
    *   **Method:** `PUT`
    *   **URI:** `/queues/members/{id}`
    *   **Description:** Updates members of a specific queue.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/queues/members/500" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"member": "Local/100@from-queue/n,0", "dynmembers": "101,0"}'
        ```

---

## Module: SMS

### Media
*   **Get Media**
    *   **Method:** `GET`
    *   **URI:** `/sms/media/{id}`
    *   **Description:** Retrieves SMS media content by ID.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/sms/media/123" \
             -H "Authorization: Bearer <access_token>"
        ```

---

## Module: Time Conditions

### Conditions
*   **List Time Conditions**
    *   **Method:** `GET`
    *   **URI:** `/timeconditions/`
    *   **Description:** Retrieves a list of all time conditions.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/timeconditions/" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Time Condition State**
    *   **Method:** `GET`
    *   **URI:** `/timeconditions/{id}`
    *   **Description:** Retrieves the state of a specific time condition.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/timeconditions/1" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update Time Condition State**
    *   **Method:** `PUT`
    *   **URI:** `/timeconditions/{id}`
    *   **Description:** Updates the state of a specific time condition.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/timeconditions/1" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"state": "true"}'
        ```

---

## Module: UCP (User Control Panel)

### Dashboard
*   **List Dashboards**
    *   **Method:** `GET`
    *   **URI:** `/ucp/dashboard/tab`
    *   **Description:** Retrieves a list of UCP dashboards for the user.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/ucp/dashboard/tab" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Update Dashboard Layout**
    *   **Method:** `POST`
    *   **URI:** `/ucp/dashboard/tab/layout`
    *   **Description:** Updates the order of dashboard tabs.
    *   **cURL:**
        ```bash
        curl -X POST "http://<your-server>/admin/api/rest/ucp/dashboard/tab/layout" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '["id1", "id2"]'
        ```

*   **Create Dashboard**
    *   **Method:** `PUT`
    *   **URI:** `/ucp/dashboard/tab`
    *   **Description:** Creates a new dashboard.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/ucp/dashboard/tab" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"name": "New Dashboard"}'
        ```

*   **Update Dashboard**
    *   **Method:** `POST`
    *   **URI:** `/ucp/dashboard/tab/{dashboard_id}`
    *   **Description:** Updates a specific dashboard.
    *   **cURL:**
        ```bash
        curl -X POST "http://<your-server>/admin/api/rest/ucp/dashboard/tab/dashboard-uuid" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"name": "Updated Name"}'
        ```

*   **Delete Dashboard**
    *   **Method:** `DELETE`
    *   **URI:** `/ucp/dashboard/tab/{dashboard_id}`
    *   **Description:** Deletes a specific dashboard.
    *   **cURL:**
        ```bash
        curl -X DELETE "http://<your-server>/admin/api/rest/ucp/dashboard/tab/dashboard-uuid" \
             -H "Authorization: Bearer <access_token>"
        ```

---

## Module: Userman (User Manager)

### Users
*   **List Users**
    *   **Method:** `GET`
    *   **URI:** `/userman/users`
    *   **Description:** Retrieves a list of all Userman users.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/userman/users" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get User**
    *   **Method:** `GET`
    *   **URI:** `/userman/users/{id}`
    *   **Description:** Retrieves details of a specific Userman user (by username).
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/userman/users/admin" \
             -H "Authorization: Bearer <access_token>"
        ```

### Extensions
*   **List Extensions**
    *   **Method:** `GET`
    *   **URI:** `/userman/extensions`
    *   **Description:** Retrieves a list of default extensions associated with users.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/userman/extensions" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get User by Extension**
    *   **Method:** `GET`
    *   **URI:** `/userman/extensions/{id}`
    *   **Description:** Retrieves user details by default extension.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/userman/extensions/100" \
             -H "Authorization: Bearer <access_token>"
        ```

---

## Module: Voicemail

### Mailboxes
*   **Get Mailbox**
    *   **Method:** `GET`
    *   **URI:** `/voicemail/mailboxes/{id}`
    *   **Description:** Retrieves voicemail mailbox details.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/admin/api/rest/voicemail/mailboxes/100" \
             -H "Authorization: Bearer <access_token>"
        ```

### Password
*   **Update Password**
    *   **Method:** `PUT`
    *   **URI:** `/voicemail/password/{id}`
    *   **Description:** Updates the voicemail password for a mailbox.
    *   **cURL:**
        ```bash
        curl -X PUT "http://<your-server>/admin/api/rest/voicemail/password/100" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"password": "1234"}'
        ```

---

## Module: RestApps (Phone Apps)

### Sync
*   **Sync Phone Apps**
    *   **Method:** `POST`
    *   **URI:** `/restapps/sync.php`
    *   **Description:** Synchronizes phone applications data between the server and client devices.
    *   **cURL:**
        ```bash
        curl -X POST "http://<your-server>/restapps/sync.php" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"device_id": "device123", "app_version": "1.0"}'
        ```

### Applications
*   **List Phone Applications**
    *   **Method:** `GET`
    *   **URI:** `/restapps/applications.php`
    *   **Description:** Retrieves a list of available phone applications.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/restapps/applications.php" \
             -H "Authorization: Bearer <access_token>"
        ```

*   **Get Application**
    *   **Method:** `GET`
    *   **URI:** `/restapps/applications.php?app={app_name}`
    *   **Description:** Retrieves details of a specific phone application.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/restapps/applications.php?app=freepbx" \
             -H "Authorization: Bearer <access_token>"
        ```

### Desktop Phone API
*   **Desktop Phone Interface**
    *   **Method:** `POST`
    *   **URI:** `/restapps/dphoneApi.php`
    *   **Description:** API endpoint for desktop phone integration and control.
    *   **cURL:**
        ```bash
        curl -X POST "http://<your-server>/restapps/dphoneApi.php" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"action": "dial", "extension": "100"}'
        ```

### Images
*   **Get Application Image**
    *   **Method:** `GET`
    *   **URI:** `/restapps/image.php?file={filename}`
    *   **Description:** Retrieves image assets for phone applications.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/restapps/image.php?file=icon.png" \
             -H "Authorization: Bearer <access_token>" \
             -o icon.png
        ```

---

## Module: Web Callback

### Callback Request
*   **Initiate Web Callback**
    *   **Method:** `POST`
    *   **URI:** `/wcb.php`
    *   **Description:** Initiates a web callback request to connect a user to a phone number.
    *   **cURL:**
        ```bash
        curl -X POST "http://<your-server>/wcb.php" \
             -H "Authorization: Bearer <access_token>" \
             -H "Content-Type: application/json" \
             -d '{"source": "100", "destination": "18005551234", "context": "from-internal"}'
        ```

*   **Get Callback Status**
    *   **Method:** `GET`
    *   **URI:** `/wcb.php?id={callback_id}`
    *   **Description:** Retrieves the status of a web callback request.
    *   **cURL:**
        ```bash
        curl -X GET "http://<your-server>/wcb.php?id=callback123" \
             -H "Authorization: Bearer <access_token>"
        ```
