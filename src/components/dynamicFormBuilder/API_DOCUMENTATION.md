# Dynamic Form Builder - API Documentation

> Backend team ke liye: Ye document `dynamicFormBuilder` module mein use hone wale sabhi APIs ka detail hai. Niche diye gaye har API ko backend pe implement karna hai.

---

## Standard Response Format

Sabhi APIs ka response **yahi format** hona chahiye:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": []
}
```

| Field     | Type    | Description                            |
|-----------|---------|----------------------------------------|
| `success` | boolean | `true` = success, `false` = failure    |
| `message` | string  | User ko dikhane wala message           |
| `data`    | array/object | Response data                     |

---

## Base URL

```
{BASE_URL}/api/v1
```

---

## API List

---

### 1. Get Common API Controls (Menu + Form List)

**Used in:** `index.jsx` → `getDropdownlistData()`

| Property | Value |
|----------|-------|
| **Name** | Get Common API Controls |
| **Endpoint** | `GET /CommonAPI/GetCommonAPIControls` |
| **Auth Required** | Yes |

**Query Params:** None

**Response:**

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "TypeID": 1,
      "TextField": "Patient Management",
      "ValueField": 10
    },
    {
      "TypeID": 2,
      "TextField": "Patient Registration Form",
      "ValueField": 101
    }
  ]
}
```

**TypeID Values:**
- `TypeID = 1` → Menu List (Left side menu items)
- `TypeID = 2` → Screen/Form List (Already built forms)

**FilterField1, PrintOrder fields (for TypeID=2 only):**

```json
{
  "TypeID": 2,
  "TextField": "Patient Form",
  "ValueField": 101,
  "FilterField1": 10,
  "PrintOrder": "1,2,3"
}
```

- `FilterField1` → MenuID jisse ye form linked hai
- `PrintOrder` → Comma-separated role IDs jiske liye ye form accessible hai

---

### 2. Get Screen Builder Common API List

**Used in:** `index.jsx` & `RightPanel.jsx` → `getApiList(type, commonAPIID)`

| Property | Value |
|----------|-------|
| **Name** | Get Screen Builder Common API List |
| **Endpoint** | `GET /ScreenBuilder/GetCommonAPIList` |
| **Auth Required** | Yes |

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | number | Yes | `1` = All APIs list, `2` = Type-based API list |
| `commonAPIID` | number | Yes | `0` = all, ya specific API ID |

**Response (type=1):**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "ID": 5,
      "APIName": "Save Employee",
      "url": "Employee/SaveEmployee",
      "method": "POST",
      "payload": "Name$''$text$1#DeptID$0$number$1#id$0$number$0#saveType$Save$text$0",
      "DefaultPayload": "",
      "IsSaveAPI": 1,
      "IsTypeID": 0,
      "getValueKey": null,
      "setValueKey": null
    },
    {
      "ID": 3,
      "APIName": "Get Departments",
      "url": "CommonAPI/GetDepartments",
      "method": "GET",
      "payload": "TypeID$1",
      "DefaultPayload": "TypeID=1",
      "IsSaveAPI": 0,
      "IsTypeID": 1,
      "getValueKey": null,
      "setValueKey": null
    }
  ]
}
```

**Response (type=2) - TypeID based:**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "TypeID": 1,
      "TypeName": "General"
    },
    {
      "TypeID": 2,
      "TypeName": "Specific"
    }
  ]
}
```

**IsSaveAPI Values:**
- `IsSaveAPI = 1` → Ye API Save/Update/Delete ke liye hai (button pe assign hogi)
- `IsSaveAPI = 0` → Ye API data fetch ke liye hai (dropdown/grid data)

**Payload Format (string):**
```
FieldName$DefaultValue$DataType$IsShowInKeyList
```
Example: `Name$''$text$1#DeptID$0$number$1#id$0$number$0#saveType$Save$text$0`
- `$` separator for each field's properties
- `#` separator for multiple fields
- Last part `$1` means shown in key dropdown, `$0` means hidden

---

### 3. Get Screen Builder Page Configuration

**Used in:** `DynamicFormbuilderScreen.jsx` & `index.jsx` → `getScreenData(id)` / `GetScreenBuilderPageConfiguration(id)`

| Property | Value |
|----------|-------|
| **Name** | Get Screen Builder Page Configuration |
| **Endpoint** | `GET /ScreenBuilder/GetPageConfiguration` |
| **Auth Required** | Yes |

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | SubMenuID ya FormID jiske controls chahiye |

**Response:**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "PageConfigurationID": 1,
      "APIURLID": 5,
      "respClass": "field-unique-uuid-123",
      "Type": "select",
      "DisplayName": "Department",
      "ControlName": "DeptID",
      "CommonControlName": "DeptID$1$number$1",
      "url": "CommonAPI/GetDepartments",
      "method": "GET",
      "payload": "TypeID$1",
      "DefaultPayload": "TypeID=1",
      "TableHeader": null,
      "ExtraParameter": "{\"AddInMultigridControl\": false, \"isFilterEnable\": 0, \"isAllOption\": false, \"maxLength\": null}",
      "IsMandatory": 1,
      "IsDisabled": 0,
      "AccordionName": "Save",
      "OptionLabelKey": "TextField",
      "OptionValueKey": "ValueField",
      "IsTypeID": 0,
      "CommonAPITypeID": 0,
      "TypeIDName": "TypeID",
      "IsAddEnable": 0,
      "IsSearchable": 1,
      "IsPdf": 0,
      "IsExcel": 0,
      "IsSerialNumber": 0,
      "IsNumberOnly": 0
    },
    {
      "PageConfigurationID": 2,
      "APIURLID": 5,
      "respClass": "field-unique-uuid-456",
      "Type": "input",
      "DisplayName": "Employee Name",
      "ControlName": "Name",
      "CommonControlName": "Name$''$text$1",
      "url": "Employee/SaveEmployee",
      "method": "POST",
      "payload": "Name$''$text$1#DeptID$0$number$1#id$0$number$0#saveType$Save$text$0",
      "DefaultPayload": null,
      "TableHeader": null,
      "ExtraParameter": "{\"AddInMultigridControl\": false, \"isFilterEnable\": 0, \"isAllOption\": false, \"maxLength\": 100}",
      "IsMandatory": 1,
      "IsDisabled": 0,
      "AccordionName": "Save",
      "OptionLabelKey": null,
      "OptionValueKey": null,
      "IsTypeID": 0,
      "CommonAPITypeID": 0,
      "TypeIDName": null,
      "IsAddEnable": 0,
      "IsSearchable": 0,
      "IsPdf": 0,
      "IsExcel": 0,
      "IsSerialNumber": 0,
      "IsNumberOnly": 0
    },
    {
      "PageConfigurationID": 3,
      "APIURLID": 3,
      "respClass": "field-unique-uuid-789",
      "Type": "grid",
      "DisplayName": "Employee List",
      "ControlName": "EmployeeGrid",
      "CommonControlName": null,
      "url": "Employee/GetEmployeeList",
      "method": "GET",
      "payload": null,
      "DefaultPayload": "",
      "TableHeader": "[{\"tableKey\":\"Name\",\"tableColumnName\":\"Employee Name\",\"tableColumnWidth\":\"20%\",\"tableFieldType\":\"text\",\"tableColumnAlignment\":\"left\",\"tableControlType\":\"No Control\",\"isMandatoryTableField\":false,\"isBold\":false,\"isTotal\":false}]",
      "ExtraParameter": "{\"AddInMultigridControl\": false, \"isFilterEnable\": 0, \"isAllOption\": false, \"maxLength\": null}",
      "IsMandatory": 0,
      "IsDisabled": 0,
      "AccordionName": "Search",
      "OptionLabelKey": null,
      "OptionValueKey": null,
      "IsTypeID": 0,
      "CommonAPITypeID": 0,
      "TypeIDName": null,
      "IsAddEnable": 0,
      "IsSearchable": 1,
      "IsPdf": 1,
      "IsExcel": 1,
      "IsSerialNumber": 1,
      "IsNumberOnly": 0
    },
    {
      "PageConfigurationID": 4,
      "APIURLID": 5,
      "respClass": "field-unique-uuid-999",
      "Type": "button",
      "DisplayName": "Save",
      "ControlName": "SaveBtn",
      "CommonControlName": null,
      "url": "Employee/SaveEmployee",
      "method": "POST",
      "payload": "Name$''$text$1#DeptID$0$number$1#id$0$number$0#saveType$Save$text$0",
      "DefaultPayload": null,
      "TableHeader": null,
      "ExtraParameter": null,
      "IsMandatory": 0,
      "IsDisabled": 0,
      "AccordionName": "Save",
      "OptionLabelKey": null,
      "OptionValueKey": null,
      "IsTypeID": 0,
      "CommonAPITypeID": 0,
      "TypeIDName": null,
      "IsAddEnable": 0,
      "IsSearchable": 0,
      "IsPdf": 0,
      "IsExcel": 0,
      "IsSerialNumber": 0,
      "IsNumberOnly": 0
    }
  ]
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `PageConfigurationID` | int | Primary key |
| `APIURLID` | int | Linked API ka ID (foreign key to API master) |
| `respClass` | string | Unique identifier (UUID) for this control |
| `Type` | string | Control type: `input`, `select`, `multiselect`, `grid`, `button`, `textarea`, `datepicker`, `timepicker`, `excelDownloader`, `excelUploader`, `heading`, `checkbox` |
| `DisplayName` | string | Control ka label/heading |
| `ControlName` | string | Form field ka name (DB column naam) |
| `CommonControlName` | string | Key definition string: `FieldName$DefaultValue$DataType$IsShowInKey` |
| `url` | string | API endpoint |
| `method` | string | HTTP method: `GET` ya `POST` |
| `payload` | string | Save API ke liye payload definition string |
| `DefaultPayload` | string | GET API ke liye default query params |
| `TableHeader` | string | Grid ke liye column config (JSON string) ya Select ke liye dependency config |
| `ExtraParameter` | string | JSON string: `{AddInMultigridControl, isFilterEnable, isAllOption, maxLength}` |
| `IsMandatory` | int | `1` = required, `0` = optional |
| `IsDisabled` | int | `1` = disabled on edit mode |
| `AccordionName` | string | `"Save"` = Save mode mein dikhao, `"Update"` = Update mode mein dikhao, `"Search"` = Search section |
| `OptionLabelKey` | string | Select dropdown ke liye label field naam |
| `OptionValueKey` | string | Select dropdown ke liye value field naam |
| `IsTypeID` | int | `1` = TypeID based filtering lagao, `0` = normal list |
| `CommonAPITypeID` | int | TypeID value for filtering (IsTypeID=1 ho toh) |
| `TypeIDName` | string | TypeID field ka naam (default: "TypeID") |
| `IsAddEnable` | int | `1` = select mein add new option button dikhao |
| `IsSearchable` | int | Grid searchable ho |
| `IsPdf` | int | Grid mein PDF export button dikhao |
| `IsExcel` | int | Grid mein Excel export button dikhao |
| `IsSerialNumber` | int | Grid mein serial number column dikhao |
| `IsNumberOnly` | int | Input mein sirf numbers allow karo |

**AccordionName Logic:**
- `"Save"` → Sirf save karte time (new form) dikhega
- `"Update"` → Sirf update karte time dikhega (grid row edit)
- `"Search"` → Hamesha dikhega, grid ke saath search button ke roop mein

---

### 4. Save Screen Builder Configuration

**Used in:** `index.jsx` → `handleSaveForm()` → `SaveScreenBuilderAPI(payload)`

| Property | Value |
|----------|-------|
| **Name** | Save Screen Builder Configuration |
| **Endpoint** | `POST /ScreenBuilder/SaveScreenBuilder` |
| **Auth Required** | Yes |

**Request Body:**

```json
{
  "urlName": "employee_management",
  "vUrlID": 0,
  "displayName": "Employee Management",
  "menuID": 10,
  "isDynamicScreen": 1,
  "roleIdList": [
    { "roleID": 1 },
    { "roleID": 2 }
  ],
  "controlList": [
    {
      "apiurlid": 3,
      "accordionName": "Save",
      "controlName": "DeptID",
      "displayName": "Department",
      "commonControlName": "DeptID$1$number$1",
      "type": "select",
      "isMandatory": 1,
      "isReadOnly": 0,
      "isDisabled": 0,
      "isAddEnable": 0,
      "sequenceNo": 1,
      "className": "col-xl-2 col-md-4 col-sm-6 col-12",
      "defaultValue": "",
      "OptionLabelKey": "TextField",
      "OptionValueKey": "ValueField",
      "respClass": "field-uuid-123",
      "commonAPITypeID": 0,
      "isShowCount": 0,
      "isCapital": 0,
      "isNumberOnly": 0,
      "ExtraParameter": "{\"AddInMultigridControl\":false,\"isFilterEnable\":0,\"isAllOption\":false,\"maxLength\":null}",
      "IsExcel": 0,
      "IsPdf": 0,
      "IsSerialNumber": 0,
      "isSearchable": 0,
      "isTotalRow": 0,
      "isColorCoding": 0,
      "tableHeader": ""
    },
    {
      "apiurlid": 5,
      "accordionName": "Save",
      "controlName": "Name",
      "displayName": "Employee Name",
      "commonControlName": "Name$''$text$1",
      "type": "input",
      "isMandatory": 1,
      "isReadOnly": 0,
      "isDisabled": 0,
      "isAddEnable": 0,
      "sequenceNo": 2,
      "className": "col-xl-2 col-md-4 col-sm-6 col-12",
      "defaultValue": "",
      "OptionLabelKey": "",
      "OptionValueKey": "",
      "respClass": "field-uuid-456",
      "commonAPITypeID": 0,
      "isShowCount": 0,
      "isCapital": 0,
      "isNumberOnly": 0,
      "ExtraParameter": "{\"AddInMultigridControl\":false,\"isFilterEnable\":0,\"isAllOption\":false,\"maxLength\":100}",
      "IsExcel": 0,
      "IsPdf": 0,
      "IsSerialNumber": 0,
      "isSearchable": 0,
      "isTotalRow": 0,
      "isColorCoding": 0,
      "tableHeader": ""
    },
    {
      "apiurlid": 5,
      "accordionName": "Save",
      "controlName": "SaveBtn",
      "displayName": "Save",
      "commonControlName": "",
      "type": "button",
      "isMandatory": 0,
      "isReadOnly": 0,
      "isDisabled": 0,
      "isAddEnable": 0,
      "sequenceNo": 3,
      "className": "col-xl-2 col-md-4 col-sm-6 col-12",
      "defaultValue": "",
      "OptionLabelKey": "",
      "OptionValueKey": "",
      "respClass": "field-uuid-789",
      "commonAPITypeID": 0,
      "isShowCount": 0,
      "isCapital": 0,
      "isNumberOnly": 0,
      "ExtraParameter": "{}",
      "IsExcel": 0,
      "IsPdf": 0,
      "IsSerialNumber": 0,
      "isSearchable": 0,
      "isTotalRow": 0,
      "isColorCoding": 0,
      "tableHeader": ""
    }
  ]
}
```

**Request Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `urlName` | string | Form ka unique URL name (spaces → underscore) |
| `vUrlID` | int | `0` = new form, `> 0` = existing form update karna |
| `displayName` | string | Form ka display name |
| `menuID` | int | Jis menu se form linked hai uska ID |
| `isDynamicScreen` | int | Hamesha `1` |
| `roleIdList` | array | Jinhe access dena hai unke role IDs |
| `controlList` | array | Sabhi controls ki list |

**controlList Item Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `apiurlid` | int | Linked API ka ID |
| `accordionName` | string | `"Save"`, `"Update"`, `"Search"`, ya button type (`"Grid Save"`, `"Delete"` etc.) |
| `controlName` | string | Field ka DB column name |
| `displayName` | string | Field ka label |
| `commonControlName` | string | Payload key definition |
| `type` | string | Control type |
| `isMandatory` | int | 0/1 |
| `isDisabled` | int | 0/1 |
| `isAddEnable` | int | 0/1 (select mein add button) |
| `sequenceNo` | int | Display order |
| `className` | string | Bootstrap CSS class for width |
| `OptionLabelKey` | string | Dropdown label field |
| `OptionValueKey` | string | Dropdown value field |
| `respClass` | string | Control ka UUID |
| `ExtraParameter` | string | JSON string with extra settings |
| `tableHeader` | string | Grid column config (JSON string) |

**tableHeader format (for grid type):**

```json
[
  {
    "tableKey": "Name",
    "tableColumnName": "Employee Name",
    "tableColumnWidth": "20%",
    "tableFieldType": "text",
    "tableColumnAlignment": "left",
    "tableControlType": "No Control",
    "isMandatoryTableField": false,
    "isBold": false,
    "isTotal": false,
    "tableControlapiName": null,
    "tableControlsetLabelKey": null,
    "tableControlsetValueKey": null
  }
]
```

**tableHeader format (for select type - dependency config):**

```json
{
  "label": "City",
  "value": "parent-field-uuid",
  "keyName": "StateID$1$number$1",
  "CurrentId": "current-field-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Form saved successfully",
  "data": null
}
```

---

### 5. Get Roles List

**Used in:** `index.jsx` → `getRoleList()` → `BindCommonAPIGetRoles()`

| Property | Value |
|----------|-------|
| **Name** | Get Roles List |
| **Endpoint** | `GET /CommonAPI/GetRoles` |
| **Auth Required** | Yes |

**Query Params:** None

**Response:**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "ID": 1,
      "RoleName": "Admin"
    },
    {
      "ID": 2,
      "RoleName": "Doctor"
    },
    {
      "ID": 3,
      "RoleName": "Receptionist"
    }
  ]
}
```

---

### 6. Bind Report Controls (Menu List)

**Used in:** `index.jsx` → `getMenuList()` → `BindReportControlsAPI()`

| Property | Value |
|----------|-------|
| **Name** | Bind Report Controls |
| **Endpoint** | `GET /Finance/BindReportControls` |
| **Auth Required** | Yes |

**Query Params:** None

**Response:**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "TypeID": 11,
      "TextField": "OPD Management",
      "ValueField": 5
    },
    {
      "TypeID": 11,
      "TextField": "Patient Registration",
      "ValueField": 6
    }
  ]
}
```

> Frontend sirf `TypeID = 11` wale items use karta hai menu list ke liye.

---

### 7. Generic Dynamic API (getFormBuilderAPIList)

**Used in:** Puri dynamicFormBuilder module mein wherever data fetch/submit hota hai

Ye ek **generic wrapper function** hai jo kisi bhi URL ko call kar sakti hai. Har screen builder form mein configured APIs is function se call hote hain.

**Signature:**
```
getFormBuilderAPIList(url, method = "GET", payload = null)
```

**GET Request Example:**
```
GET /{url}?param1=value1&param2=value2
```

**POST Request Example:**
```
POST /{url}
Body: { "param1": "value1", "param2": "value2" }
```

**Standard Response (jo sabhi dynamic APIs return karein):**

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [
    {
      "ID": 1,
      "Name": "Example"
    }
  ]
}
```

**Use Cases:**
1. **Dropdown data load** → Select/Multiselect ke options fetch karna
2. **Grid data load** → Table mein data fetch karna
3. **Form Save** → Button click pe POST request
4. **Search** → Search button click pe data filter karna
5. **Excel Upload** → Base64 file upload
6. **Excel Download** → Data fetch karke Excel mein export karna
7. **Modal API** → Popup se koi action karna

---

## FormBuilder Module APIs (Frontend/FormBuilder/)

Ye APIs alag FormBuilder module ke liye hain jo drag-drop se custom forms banane ke liye use hota hai.

---

### 8. Get Field Type Master

**Used in:** `Frontend/FormBuilder/FormBuilder.jsx` → `FormBuilderGetFieldTypeMaster()`

| Property | Value |
|----------|-------|
| **Name** | Get Field Type Master |
| **Endpoint** | `GET /FormBuilder/GetFieldTypeMaster` |
| **Auth Required** | Yes |

**Response:**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "field_type_id": 1,
      "display_name": "Text Input",
      "supports_input_subtype": 1,
      "input_sub_types": [
        {
          "input_sub_type_id": 1,
          "input_sub_type_code": "text"
        },
        {
          "input_sub_type_id": 2,
          "input_sub_type_code": "number"
        },
        {
          "input_sub_type_id": 3,
          "input_sub_type_code": "email"
        }
      ]
    },
    {
      "field_type_id": 2,
      "display_name": "Textarea",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 3,
      "display_name": "Dropdown (Single)",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 4,
      "display_name": "Dropdown (Multi)",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 5,
      "display_name": "Checkbox",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 8,
      "display_name": "Time Picker",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 9,
      "display_name": "Date Picker",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 10,
      "display_name": "Radio Button",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 11,
      "display_name": "Table",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 12,
      "display_name": "Score Badge",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 13,
      "display_name": "Sub Heading",
      "supports_input_subtype": 0,
      "input_sub_types": []
    },
    {
      "field_type_id": 15,
      "display_name": "Button",
      "supports_input_subtype": 0,
      "input_sub_types": []
    }
  ]
}
```

---

### 9. Get Form Type Master

**Used in:** `Frontend/FormBuilder/FormBuilder.jsx` → `FormBuilderGetFormTypeMaster()`

| Property | Value |
|----------|-------|
| **Name** | Get Form Type Master |
| **Endpoint** | `GET /FormBuilder/GetFormTypeMaster` |
| **Auth Required** | Yes |

**Response:**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "form_type_id": 1,
      "display_name": "OPD Form"
    },
    {
      "form_type_id": 2,
      "display_name": "IPD Form"
    },
    {
      "form_type_id": 3,
      "display_name": "Lab Form"
    }
  ]
}
```

---

### 10. Get Other Table Linkage

**Used in:** `Frontend/FormBuilder/FormBuilder.jsx` → `FormBuilderGetOtherTableLinkage(type)`

| Property | Value |
|----------|-------|
| **Name** | Get Other Table Linkage |
| **Endpoint** | `GET /FormBuilder/GetOtherTableLinkage` |
| **Auth Required** | Yes |

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | int | Yes | `0` = Master tables (dropdown master), `1` = General tables |

**Response:**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "Id": 1,
      "table_name": "Department Master"
    },
    {
      "Id": 2,
      "table_name": "Gender Master"
    }
  ]
}
```

---

### 11. Create and Update Form Layout

**Used in:** `Frontend/FormBuilder/FormBuilder.jsx` → `handleSave()` → `FormBuilderCreateAndUpdateFormLayout(payload)`

| Property | Value |
|----------|-------|
| **Name** | Create and Update Form Layout |
| **Endpoint** | `POST /FormBuilder/CreateAndUpdateFormLayout` |
| **Auth Required** | Yes |

**Request Body:**

```json
{
  "formDetial": {
    "form_id": 0,
    "form_code": "patient_assessment",
    "form_name": "patient_assessment",
    "form_display_name": "Patient Assessment",
    "description": "",
    "form_type_id": 1,
    "is_active": 1,
    "form_css": "card p-3 shadow-sm",
    "isTabularView": 0,
    "isPrintRequired": 1,
    "printView": "PatientAssessmentPrint"
  },
  "formSections": [
    {
      "section_id": 0,
      "form_id": 0,
      "section_title": "Patient Details",
      "width_id": 0,
      "display_order": 1,
      "is_active": 1,
      "section_css": "col-xl-12 col-md-12 col-sm-12 col-12",
      "formFields": [
        {
          "field_id": 0,
          "form_id": 0,
          "section_id": 0,
          "field_label": "Patient Name",
          "field_name": "patient_name",
          "field_type_id": 1,
          "input_sub_type_id": 1,
          "width_id": 0,
          "is_required": 1,
          "field_default_value": "",
          "is_field_disabled": 0,
          "secondary_label": "",
          "table_linkage_id": 0,
          "is_score": 0,
          "iscustomtable": 0,
          "isapidefaultvalue": 0,
          "score_formula": "",
          "field_order": 1,
          "options_json": [],
          "is_child": 0,
          "parent_name": "",
          "parentId": 0,
          "field_css": "col-xl-3 col-md-4 col-sm-6 col-12"
        },
        {
          "field_id": 0,
          "form_id": 0,
          "section_id": 0,
          "field_label": "Gender",
          "field_name": "gender",
          "field_type_id": 3,
          "input_sub_type_id": 0,
          "width_id": 0,
          "is_required": 1,
          "field_default_value": "",
          "is_field_disabled": 0,
          "secondary_label": "",
          "table_linkage_id": 2,
          "is_score": 0,
          "iscustomtable": 0,
          "isapidefaultvalue": 0,
          "score_formula": "",
          "field_order": 2,
          "options_json": [],
          "is_child": 0,
          "parent_name": "",
          "parentId": 0,
          "field_css": "col-xl-3 col-md-4 col-sm-6 col-12"
        },
        {
          "field_id": 0,
          "form_id": 0,
          "section_id": 0,
          "field_label": "Blood Group",
          "field_name": "blood_group",
          "field_type_id": 3,
          "input_sub_type_id": 0,
          "width_id": 0,
          "is_required": 0,
          "field_default_value": "A+",
          "is_field_disabled": 0,
          "secondary_label": "",
          "table_linkage_id": 0,
          "is_score": 0,
          "iscustomtable": 0,
          "isapidefaultvalue": 0,
          "score_formula": "",
          "field_order": 3,
          "options_json": [
            { "label": "A+", "value": "A+", "FilterById": "" },
            { "label": "B+", "value": "B+", "FilterById": "" },
            { "label": "O+", "value": "O+", "FilterById": "" }
          ],
          "is_child": 0,
          "parent_name": "",
          "parentId": 0,
          "field_css": "col-xl-3 col-md-4 col-sm-6 col-12"
        }
      ]
    }
  ]
}
```

**Request Body Fields:**

`formDetial` Object:

| Field | Type | Description |
|-------|------|-------------|
| `form_id` | int | `0` = new form, `> 0` = update existing |
| `form_code` | string | Unique code (auto-generated from display name) |
| `form_name` | string | DB table/identifier name |
| `form_display_name` | string | User facing title |
| `description` | string | Form description |
| `form_type_id` | int | Form type ID (from API #9) |
| `is_active` | int | `1` = active |
| `form_css` | string | CSS class for form wrapper |
| `isTabularView` | int | `1` = detailed table required |
| `isPrintRequired` | int | `1` = print option dikhao |
| `printView` | string | Print component ka naam |

`formFields` Array Item:

| Field | Type | Description |
|-------|------|-------------|
| `field_id` | int | `0` = new, `> 0` = existing field update |
| `field_label` | string | Label jo user dekhega |
| `field_name` | string | DB column name (snake_case) |
| `field_type_id` | int | Field type (from API #8) |
| `input_sub_type_id` | int | Input sub type (text, number, email etc.) |
| `is_required` | int | `0/1` |
| `field_default_value` | string | Default value. Special: `"CURRENT_DATE"`, `"CURRENT_TIME"`, `"1"` for checkbox |
| `is_field_disabled` | int | `0/1` |
| `secondary_label` | string | Input ke neeche secondary label |
| `table_linkage_id` | int | `0` = manual options, `> 0` = master table se options (API #10) |
| `is_score` | int | `1` = ye field score calculate karta hai |
| `iscustomtable` | int | `1` = ye field kisi Table field ka part hai |
| `isapidefaultvalue` | int | `1` = default value API se aata hai |
| `score_formula` | string | Score calculation formula |
| `field_order` | int | Display sequence |
| `options_json` | array | `[{label, value, FilterById}]` - manual dropdown options |
| `is_child` | int | `1` = parent-child dependency hai |
| `parent_name` | string | Parent field ka `field_name` |
| `parentId` | int | Parent field ka ID |
| `field_css` | string | Bootstrap CSS class |

**Response:**

```json
{
  "success": true,
  "message": "Form created successfully (Form Number: 15)",
  "data": 15
}
```

> `data` mein naya `form_id` return hoga.

---

## Important Notes for Backend Team

### 1. Payload String Format

`ScreenBuilder/GetPageConfiguration` ke response mein `payload` field ek special string format mein hota hai:

```
FieldName$DefaultValue$DataType$IsVisibleInKeyList#FieldName2$DefaultValue2$DataType2$IsVisibleInKeyList2
```

Example: `Name$''$text$1#DeptID$0$number$1#id$0$number$0#saveType$Save$text$0`

- `#` se multiple fields separate hote hain
- `$` se ek field ki properties separate hoti hain
- `DataType` = `text` ya `number`
- `IsVisibleInKeyList` = `1` (field builder mein key dropdown mein dikhao), `0` (hide karo)

### 2. ExtraParameter JSON Format

```json
{
  "AddInMultigridControl": false,
  "isFilterEnable": 0,
  "isAllOption": false,
  "maxLength": null
}
```

- `AddInMultigridControl` = `true` means ye field multigrid mein add hogi
- `isFilterEnable` = `1` means ye field grid ko filter karega
- `isAllOption` = `true` means dropdown mein "All" option add karo
- `maxLength` = input field ki maximum length

### 3. TableHeader for Grid

Grid type controls ke `tableHeader` mein JSON array store hoti hai columns ki:

```json
[
  {
    "tableKey": "EmployeeID",
    "tableColumnName": "Employee ID",
    "tableColumnWidth": "10%",
    "tableFieldType": "number",
    "tableColumnAlignment": "center",
    "tableControlType": "No Control",
    "isMandatoryTableField": false,
    "isBold": false,
    "isTotal": false,
    "tableControlapiName": null,
    "tableControlsetLabelKey": null,
    "tableControlsetValueKey": null
  }
]
```

`tableControlType` values: `"No Control"`, `"Input"`, `"Select"`, `"Checkbox"`, `"Date Picker"`, `"Time Picker"`

### 4. AccordionName for Buttons

Button controls ke `accordionName` (ya `isTypeAPI`) mein ye values aati hain:
- `"Save"` → Normal save button
- `"Update"` → Update button
- `"Delete"` → Delete button
- `"Search"` → Search button (grid reload karta hai)
- `"Grid Save"` → Grid ke data ke saath save
- `"None"` → Koi action nahi

### 5. Dynamic API Response Consistency

Har dynamic API (dropdown, grid, save) ka response isi format mein hona chahiye:
```json
{ "success": true/false, "message": "...", "data": [...] }
```

---

## API Summary Table

| # | API Name | Endpoint | Method | Module |
|---|----------|----------|--------|--------|
| 1 | Get Common API Controls | `/CommonAPI/GetCommonAPIControls` | GET | FormBuilder |
| 2 | Get Screen Builder Common API List | `/ScreenBuilder/GetCommonAPIList` | GET | FormBuilder |
| 3 | Get Screen Builder Page Configuration | `/ScreenBuilder/GetPageConfiguration` | GET | Both |
| 4 | Save Screen Builder Configuration | `/ScreenBuilder/SaveScreenBuilder` | POST | FormBuilder |
| 5 | Get Roles List | `/CommonAPI/GetRoles` | GET | FormBuilder |
| 6 | Bind Report Controls | `/Finance/BindReportControls` | GET | FormBuilder |
| 7 | Generic Dynamic API | `/{any-configured-url}` | GET/POST | DynamicScreen |
| 8 | Get Field Type Master | `/FormBuilder/GetFieldTypeMaster` | GET | New FormBuilder |
| 9 | Get Form Type Master | `/FormBuilder/GetFormTypeMaster` | GET | New FormBuilder |
| 10 | Get Other Table Linkage | `/FormBuilder/GetOtherTableLinkage` | GET | New FormBuilder |
| 11 | Create and Update Form Layout | `/FormBuilder/CreateAndUpdateFormLayout` | POST | New FormBuilder |
