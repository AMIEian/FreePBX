# API Documentation

This document outlines the RESTful APIs identified within the FreePBX project. The APIs are organized by module.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Module: Core](#module-core)
- [Module: Calendar](#module-calendar)
- [Module: Conferences](#module-conferences)
- [Module: Contact Manager](#module-contact-manager)
- [Module: Fax](#module-fax)
- [Module: Find Me / Follow Me](#module-find-me--follow-me)
- [Module: Hotel Wakeup](#module-hotel-wakeup)
- [Module: Parking](#module-parking)
- [Module: Pinsets](#module-pinsets)
- [Module: Presence State](#module-presence-state)
- [Module: Queues](#module-queues)
- [Module: SMS](#module-sms)
- [Module: Time Conditions](#module-time-conditions)
- [Module: UCP (User Control Panel)](#module-ucp-user-control-panel)
- [Module: Userman (User Manager)](#module-userman-user-manager)
- [Module: Voicemail](#module-voicemail)
- [Module: RestApps (Phone Apps)](#module-restapps-phone-apps)
- [Module: Web Callback](#module-web-callback)

## Overview

This documentation covers **18 modules** with **67 API endpoints**, each with complete cURL request examples.

### Documented Modules:
- Core
- Calendar
- Conferences
- Contact Manager
- Fax
- Find Me / Follow Me
- Hotel Wakeup
- Parking
- Pinsets
- Presence State
- Queues
- SMS
- Time Conditions
- UCP (User Control Panel)
- Userman (User Manager)
- Voicemail
- RestApps (Phone Apps)
- Web Callback

## Authentication
Most APIs require authentication. FreePBX typically uses OAuth2 for API authentication. Ensure you have obtained a valid access token.

**Header:**
`Authorization: Bearer YOUR_ACCESS_TOKEN_HERE`

**Example:**
```bash
# Replace YOUR_ACCESS_TOKEN_HERE with your actual token
# Replace freepbx.example.com with your FreePBX server address

# Example: Test authentication by listing users
curl -X GET "http://freepbx.example.com/admin/api/rest/core/users" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Module: Core

### Users
*   **List Users**
    *   **Method:** `GET`
    *   **URI:** `/core/users`
    *   **Description:** Retrieves a list of all users.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/core/users" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get User**
    *   **Method:** `GET`
    *   **URI:** `/core/users/{id}`
    *   **Description:** Retrieves details for a specific user.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/core/users/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/calendar/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Calendar**
    *   **Method:** `GET`
    *   **URI:** `/calendar/{id}`
    *   **Description:** Retrieves details of a specific calendar.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/calendar/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update Calendar**
    *   **Method:** `PUT`
    *   **URI:** `/calendar/{id}`
    *   **Description:** Updates a specific calendar.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/calendar/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/calendar/events/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update Event**
    *   **Method:** `PUT`
    *   **URI:** `/calendar/events/{id}`
    *   **Description:** Adds or updates an event in a calendar.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/calendar/events/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/conferences/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Conference**
    *   **Method:** `GET`
    *   **URI:** `/conferences/{id}`
    *   **Description:** Retrieves details of a specific conference.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/conferences/101" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Delete Conference**
    *   **Method:** `DELETE`
    *   **URI:** `/conferences/{id}`
    *   **Description:** Deletes a specific conference.
    *   **cURL:**
        ```bash
        curl -X DELETE "http://freepbx.example.com/admin/api/rest/conferences/101" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Create/Update Conference**
    *   **Method:** `PUT`
    *   **URI:** `/conferences/{id}`
    *   **Description:** Creates or updates a conference room.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/conferences/101" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/contactmanager/groups" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **List Groups by Owner**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/groups/{id}`
    *   **Description:** Retrieves contact manager groups for a specific owner ID.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/contactmanager/groups/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Group Info**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/groups/{id}/{groupid}`
    *   **Description:** Retrieves details of a specific group for a specific owner.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/contactmanager/groups/1/5" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

### Entries
*   **List Entries**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/groups/{id}/{groupid}/entries`
    *   **Description:** Retrieves entries for a specific group.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/contactmanager/groups/1/5/entries" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Entry**
    *   **Method:** `GET`
    *   **URI:** `/contactmanager/entries/{id}`
    *   **Description:** Retrieves details of a specific contact entry.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/contactmanager/entries/10" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/fax/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Detect Fax**
    *   **Method:** `GET`
    *   **URI:** `/fax/detect`
    *   **Description:** Lists fax detection modules.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/fax/detect" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update Settings**
    *   **Method:** `POST`
    *   **URI:** `/fax/`
    *   **Description:** Updates global fax settings.
    *   **cURL:**
        ```bash
        curl -X POST "http://freepbx.example.com/admin/api/rest/fax/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/fax/users" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get User Settings**
    *   **Method:** `GET`
    *   **URI:** `/fax/users/{id}`
    *   **Description:** Retrieves fax settings for a specific user.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/fax/users/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update User Settings**
    *   **Method:** `POST`
    *   **URI:** `/fax/users/{id}`
    *   **Description:** Updates fax settings for a specific user.
    *   **cURL:**
        ```bash
        curl -X POST "http://freepbx.example.com/admin/api/rest/fax/users/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/findmefollow/users" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get User Settings**
    *   **Method:** `GET`
    *   **URI:** `/findmefollow/users/{id}`
    *   **Description:** Retrieves Find Me/Follow Me settings for a specific user.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/findmefollow/users/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update User Settings**
    *   **Method:** `PUT`
    *   **URI:** `/findmefollow/users/{id}`
    *   **Description:** Updates Find Me/Follow Me settings for a specific user.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/findmefollow/users/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/hotelwakeup/code" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Languages**
    *   **Method:** `GET`
    *   **URI:** `/hotelwakeup/languages`
    *   **Description:** Retrieves list of installed languages for wakeup calls.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/hotelwakeup/languages" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **List Wakeup Calls**
    *   **Method:** `GET`
    *   **URI:** `/hotelwakeup/wakeup`
    *   **Description:** Retrieves all scheduled wakeup calls.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/hotelwakeup/wakeup" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Wakeup Call**
    *   **Method:** `GET`
    *   **URI:** `/hotelwakeup/wakeup/{id}/{ext}`
    *   **Description:** Retrieves a specific wakeup call.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/hotelwakeup/wakeup/1/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Create Wakeup Call**
    *   **Method:** `POST`
    *   **URI:** `/hotelwakeup/wakeup`
    *   **Description:** Schedules a new wakeup call.
    *   **cURL:**
        ```bash
        curl -X POST "http://freepbx.example.com/admin/api/rest/hotelwakeup/wakeup" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
             -H "Content-Type: application/json" \
             -d '{"day": "2023-10-27", "time": "07:00", "destination": "100"}'
        ```

*   **Delete Wakeup Call**
    *   **Method:** `DELETE`
    *   **URI:** `/hotelwakeup/wakeup/{id}/{ext}`
    *   **Description:** Deletes a specific wakeup call.
    *   **cURL:**
        ```bash
        curl -X DELETE "http://freepbx.example.com/admin/api/rest/hotelwakeup/wakeup/1/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/parking/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update Default Lot**
    *   **Method:** `PUT`
    *   **URI:** `/parking/`
    *   **Description:** Updates the default parking lot settings.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/parking/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/pinsets/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Pinset**
    *   **Method:** `GET`
    *   **URI:** `/pinsets/{id}`
    *   **Description:** Retrieves details of a specific pinset.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/pinsets/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update Pinset**
    *   **Method:** `PUT`
    *   **URI:** `/pinsets/{id}`
    *   **Description:** Updates a specific pinset.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/pinsets/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/presencestate/list" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **List Types**
    *   **Method:** `GET`
    *   **URI:** `/presencestate/types`
    *   **Description:** Retrieves a list of presence state types.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/presencestate/types" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get User Preferences**
    *   **Method:** `GET`
    *   **URI:** `/presencestate/prefs/{extension}`
    *   **Description:** Retrieves presence state preferences for a user.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/presencestate/prefs/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update User Preferences**
    *   **Method:** `PUT`
    *   **URI:** `/presencestate/prefs/{extension}`
    *   **Description:** Updates presence state preferences for a user.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/presencestate/prefs/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/queues/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Queue Details**
    *   **Method:** `GET`
    *   **URI:** `/queues/{id}`
    *   **Description:** Retrieves details of a specific queue.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/queues/500" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

### Queue Members
*   **List All Members**
    *   **Method:** `GET`
    *   **URI:** `/queues/members`
    *   **Description:** Retrieves all members for all queues.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/queues/members" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Queue Members**
    *   **Method:** `GET`
    *   **URI:** `/queues/members/{id}`
    *   **Description:** Retrieves members of a specific queue.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/queues/members/500" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update Queue Members**
    *   **Method:** `PUT`
    *   **URI:** `/queues/members/{id}`
    *   **Description:** Updates members of a specific queue.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/queues/members/500" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/sms/media/123" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/timeconditions/" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Time Condition State**
    *   **Method:** `GET`
    *   **URI:** `/timeconditions/{id}`
    *   **Description:** Retrieves the state of a specific time condition.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/timeconditions/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update Time Condition State**
    *   **Method:** `PUT`
    *   **URI:** `/timeconditions/{id}`
    *   **Description:** Updates the state of a specific time condition.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/timeconditions/1" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/ucp/dashboard/tab" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Update Dashboard Layout**
    *   **Method:** `POST`
    *   **URI:** `/ucp/dashboard/tab/layout`
    *   **Description:** Updates the order of dashboard tabs.
    *   **cURL:**
        ```bash
        curl -X POST "http://freepbx.example.com/admin/api/rest/ucp/dashboard/tab/layout" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
             -H "Content-Type: application/json" \
             -d '["id1", "id2"]'
        ```

*   **Create Dashboard**
    *   **Method:** `PUT`
    *   **URI:** `/ucp/dashboard/tab`
    *   **Description:** Creates a new dashboard.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/ucp/dashboard/tab" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
             -H "Content-Type: application/json" \
             -d '{"name": "New Dashboard"}'
        ```

*   **Update Dashboard**
    *   **Method:** `POST`
    *   **URI:** `/ucp/dashboard/tab/{dashboard_id}`
    *   **Description:** Updates a specific dashboard.
    *   **cURL:**
        ```bash
        curl -X POST "http://freepbx.example.com/admin/api/rest/ucp/dashboard/tab/dashboard-uuid" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
             -H "Content-Type: application/json" \
             -d '{"name": "Updated Name"}'
        ```

*   **Delete Dashboard**
    *   **Method:** `DELETE`
    *   **URI:** `/ucp/dashboard/tab/{dashboard_id}`
    *   **Description:** Deletes a specific dashboard.
    *   **cURL:**
        ```bash
        curl -X DELETE "http://freepbx.example.com/admin/api/rest/ucp/dashboard/tab/dashboard-uuid" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/userman/users" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get User**
    *   **Method:** `GET`
    *   **URI:** `/userman/users/{id}`
    *   **Description:** Retrieves details of a specific Userman user (by username).
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/userman/users/admin" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

### Extensions
*   **List Extensions**
    *   **Method:** `GET`
    *   **URI:** `/userman/extensions`
    *   **Description:** Retrieves a list of default extensions associated with users.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/userman/extensions" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get User by Extension**
    *   **Method:** `GET`
    *   **URI:** `/userman/extensions/{id}`
    *   **Description:** Retrieves user details by default extension.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/admin/api/rest/userman/extensions/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
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
        curl -X GET "http://freepbx.example.com/admin/api/rest/voicemail/mailboxes/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

### Password
*   **Update Password**
    *   **Method:** `PUT`
    *   **URI:** `/voicemail/password/{id}`
    *   **Description:** Updates the voicemail password for a mailbox.
    *   **cURL:**
        ```bash
        curl -X PUT "http://freepbx.example.com/admin/api/rest/voicemail/password/100" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
             -H "Content-Type: application/json" \
             -d '{"password": "1234"}'
        ```

---

## Module: RestApps (Phone Apps)

**Note:** RestApps endpoints are accessed directly via PHP files at the web root, not through the `/admin/api/rest/` path like other modules.

### Sync
*   **Sync Phone Apps**
    *   **Method:** `POST`
    *   **URI:** `/restapps/sync.php`
    *   **Description:** Synchronizes phone applications data between the server and client devices.
    *   **cURL:**
        ```bash
        curl -X POST "http://freepbx.example.com/restapps/sync.php" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/restapps/applications.php" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

*   **Get Application**
    *   **Method:** `GET`
    *   **URI:** `/restapps/applications.php?app={app_name}`
    *   **Description:** Retrieves details of a specific phone application.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/restapps/applications.php?app=freepbx" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```

### Desktop Phone API
*   **Desktop Phone Interface**
    *   **Method:** `POST`
    *   **URI:** `/restapps/dphoneApi.php`
    *   **Description:** API endpoint for desktop phone integration and control.
    *   **cURL:**
        ```bash
        curl -X POST "http://freepbx.example.com/restapps/dphoneApi.php" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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
        curl -X GET "http://freepbx.example.com/restapps/image.php?file=icon.png" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
             -o icon.png
        ```

---

## Module: Web Callback

**Note:** Web Callback endpoint is accessed directly via `wcb.php` at the web root, not through the `/admin/api/rest/` path like other modules.

### Callback Request
*   **Initiate Web Callback**
    *   **Method:** `POST`
    *   **URI:** `/wcb.php`
    *   **Description:** Initiates a web callback request to connect a user to a phone number.
    *   **cURL:**
        ```bash
        curl -X POST "http://freepbx.example.com/wcb.php" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
             -H "Content-Type: application/json" \
             -d '{"source": "100", "destination": "18005551234", "context": "from-internal"}'
        ```

*   **Get Callback Status**
    *   **Method:** `GET`
    *   **URI:** `/wcb.php?id={callback_id}`
    *   **Description:** Retrieves the status of a web callback request.
    *   **cURL:**
        ```bash
        curl -X GET "http://freepbx.example.com/wcb.php?id=callback123" \
             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
        ```
