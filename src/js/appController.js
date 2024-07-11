/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */

/*
 * Your application specific code will go here
 */
define([
  "ojs/ojcontext",
  "ojs/ojresponsiveutils",
  "ojs/ojresponsiveknockoututils",
  "knockout",
  "ojs/ojknockout",
  "ojs/ojarraydataprovider",
  "ojs/ojasyncvalidator-regexp",
], function (
  Context,
  ResponsiveUtils,
  ResponsiveKnockoutUtils,
  ko,
  $,
  ArrayDataProvider,
  AsyncRegExpValidator
) {
  function ControllerViewModel() {
    // Media queries for responsive layouts
    const smQuery = ResponsiveUtils.getFrameworkQuery(
      ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY
    );
    this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

    // Header
    // Application Name used in Branding Area
    this.appName = ko.observable("User Api Demo");

    // Base URL
    this.baseUrl = "http://localhost:8080/api/v1";

    // Dialog State
    this.openDialog = ko.observable(false);
    this.userDialogTitle = ko.observable("Add User");

    // User Form Fields
    this.userId = ko.observable();
    this.userName = ko.observable("");
    this.userEmail = ko.observable("");
    this.userAge = ko.observable();
    this.emailPatternValidator = ko.observableArray([
      new AsyncRegExpValidator({
        pattern:
          "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
        hint: "Enter a valid email format",
        messageDetail: "Not a valid email format",
      }),
    ]);

    this.resetUserForm = () => {
      this.userId(null);
      this.userName("");
      this.userEmail("");
      this.userAge(null);
    };

    // Table
    // Table Columns
    this.columnArray = [
      { headerText: "Name", field: "name", resizable: "enabled", id: "name" },
      {
        headerText: "Email",
        field: "email",
        resizable: "enabled",
        id: "email",
      },
      { headerText: "Age", field: "age", resizable: "enabled", id: "age" },
      {
        headerText: "Actions",
        sortable: "disabled",
        template: "actionsTemplate",
        id: "actions",
      },
    ];

    // Table Data
    this.tableUserData = ko.observableArray([]);
    this.dataProvider = new ArrayDataProvider(this.tableUserData, {
      keyAttributes: "id",
      implicitSort: [{ attribute: "id", direction: "ascending" }],
    });

    // Fetch Users
    const fetchUsers = async () => {
      try {
        const response = await fetch(this.baseUrl + "/users");
        const data = await response.json();
        this.tableUserData(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();

    // Open Dialog
    this.openDialogButton = () => {
      this.openDialog(true);
    };

    // Close Dialog
    this.closeDialog = () => {
      this.openDialog(false);
      this.resetUserForm();
    };

    // Handle Add/Edit User Modal Submit
    this.submitUserModalButtonClick = () => {
      if (this.userDialogTitle() === "Add User") {
        this.submitAddUserButtonClick();
      } else {
        this.submitEditUserButtonClick();
      }
    };

    // Add User
    this.buttonOpenerClick = () => {
      this.userDialogTitle("Add User");
      this.openDialogButton();
      document.getElementById("userModalDialog").open();
    };

    this.submitAddUserButtonClick = async () => {
      const userFormData = {
        name: this.userName(),
        email: this.userEmail(),
        age: this.userAge(),
      };

      if (
        !userFormData.name ||
        !userFormData.email ||
        isNaN(userFormData.age)
      ) {
        alert("Please fill out all fields correctly.");
        return;
      }

      try {
        const response = await fetch(this.baseUrl + "/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userFormData),
        });
        if (!response.ok) {
          alert("Failed to add user");
          return;
        }
        const data = await response.json();
        this.tableUserData.push(data);
      } catch (error) {
        console.error("Error adding user:", error);
      } finally {
        this.closeDialog();
        document.getElementById("userModalDialog").close();
      }
    };

    // Table Actions
    // Edit User
    this.editUserButtonOpenerClick = (event, context) => {
      this.userDialogTitle("Edit User");

      this.userId(context.item.data.id);
      this.userName(context.item.data.name);
      this.userEmail(context.item.data.email);
      this.userAge(context.item.data.age);

      this.openDialogButton();
      document.getElementById("userModalDialog").open();
    };

    this.submitEditUserButtonClick = async () => {
      const userFormData = {
        id: this.userId(),
        name: this.userName(),
        email: this.userEmail(),
        age: this.userAge(),
      };

      if (
        !userFormData.name ||
        !userFormData.email ||
        isNaN(userFormData.age)
      ) {
        alert("Please fill out all fields correctly.");
        return;
      }

      const userId = userFormData.id;

      try {
        const response = await fetch(this.baseUrl + "/users/" + userId, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userFormData),
        });
        if (!response.ok) {
          alert("Failed to update user");
          return;
        }
        const data = await response.json();
        const userIndex = this.tableUserData().findIndex(
          (user) => user.id === userId
        );
        this.tableUserData.splice(userIndex, 1, data);
      } catch (error) {
        console.error("Error updating user:", error);
      } finally {
        this.closeDialog();
        document.getElementById("userModalDialog").close();
      }
    };

    // Delete User
    this.deleteUserButtonClick = async (event, context) => {
      if (!confirm("Are you sure you want to delete this user?")) {
        return;
      }

      const userId = context.item.data.id;

      try {
        const response = await fetch(this.baseUrl + "/users/" + userId, {
          method: "DELETE",
        });
        if (!response.ok) {
          alert("Failed to delete user");
          return;
        }
        this.tableUserData.remove((user) => user.id === userId);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    };

    // Footer
    this.footerLinks = [
      {
        name: "About Oracle",
        linkId: "aboutOracle",
        linkTarget: "http://www.oracle.com/us/corporate/index.html#menu-about",
      },
      {
        name: "Contact Us",
        id: "contactUs",
        linkTarget: "http://www.oracle.com/us/corporate/contact/index.html",
      },
      {
        name: "Legal Notices",
        id: "legalNotices",
        linkTarget: "http://www.oracle.com/us/legal/index.html",
      },
      {
        name: "Terms Of Use",
        id: "termsOfUse",
        linkTarget: "http://www.oracle.com/us/legal/terms/index.html",
      },
      {
        name: "Your Privacy Rights",
        id: "yourPrivacyRights",
        linkTarget: "http://www.oracle.com/us/legal/privacy/index.html",
      },
    ];
  }

  // release the application bootstrap busy state
  Context.getPageContext().getBusyContext().applicationBootstrapComplete();

  return new ControllerViewModel();
});
