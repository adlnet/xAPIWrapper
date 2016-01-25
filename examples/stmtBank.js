/*
A store of valid xapi statements for testing and coverage purposes.  Please use as needed.

https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md
*/
(function (obj) {
    var ADL = obj;
    if (typeof window !== 'undefined') {
        ADL = window.ADL = obj.ADL || {};
    }
    ADL.stmts = {
        /* Requirements:
            A Statement MUST use each property no more than one time.
            A Statement MUST use “actor”, “verb”, and “object”.
            A Statement MAY use its properties in any order.
        */

        /* 0 An example of the simplest possible Statement using all properties that MUST or SHOULD be used: Actor-Verb-Object and Statement Id
        */
        stmt0: {
            "actor": {
                "mbox": "mailto:xapi@adlnet.gov",
                "objectType": "Agent"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/created",
                "display": {
                    "en-US": "created"
                }
            },
            "object": {
                "id": "http://example.adlnet.gov/xapi/example/activity",
                "objectType": "Activity"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:24:01.770727+00:00",
            "stored": "2016-01-25T20:24:01.770727+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "12345678-1234-5678-1234-567812345678"
        },

        /* 1 Actor Agent - Simple statement featured at the xapi spec https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#AppendixA
        features Actor-Verb-Object with UUID */
        stmt1: {
            "actor": {
                "mbox": "mailto:user@example.com",
                "name": "Project Tin Can API",
                "objectType": "Agent"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/created",
                "display": {
                    "en-US": "created"
                }
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:20:48.295049+00:00",
            "object": {
                "definition": {
                    "name": {
                        "en-US": "simple statement"
                    },
                    "description": {
                        "en-US": "A simple Experience API statement. Note that the LRS does not need to have any prior information about the Actor (learner), the verb, or the Activity/object."
                    }
                },
                "id": "http://example.adlnet.gov/xapi/example/simplestatement",
                "objectType": "Activity"
            },
            "stored": "2016-01-25T20:20:48.295049+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "fd41c918-b88b-4b20-a0a5-a4c32391aaa0"
        },

        /* 2 Actor Group - Simple Statment with the Actor of type Group */
        stmt2: {
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/created",
                "display": {
                    "en-US": "created"
                }
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:15:46.622339+00:00",
            "object": {
                "definition": {
                    "name": {
                        "en-US": "Example Activity"
                    },
                    "description": {
                        "en-US": "Example activity description"
                    }
                },
                "id": "http://example.adlnet.gov/xapi/example/activity",
                "objectType": "Activity"
            },
            "actor": {
                "member": [
                    {
                        "mbox": "mailto:andrew@example.com",
                        "name": "Andrew Downes",
                        "objectType": "Agent"
                    },
                    {
                        "openid": "http://aaron.openid.example.org",
                        "name": "Aaron Silvers",
                        "objectType": "Agent"
                    }
                ],
                "account": {
                    "homePage": "http://example.com/homePage",
                    "name": "GroupAccount"
                },
                "name": "Example Group",
                "objectType": "Group"
            },
            "stored": "2016-01-25T20:15:46.622339+00:00",
            "authority": {
              "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "65135a9a-b656-4445-9ffc-206ff22431c3"
        },

        /* 3 Actor Inverse Functional Identifier (IFI) mbox - Simple Statment with the Actor IFI mbox_sha1sum. */
        stmt3: {
            "actor": {
                "mbox_sha1sum": "6a113390c5a05e6e345e0f559e03a1b294c2c3a3",
                "objectType": "Agent"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/created",
                "display": {
                    "en-US": "created"
                }
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:10:38.397395+00:00",
            "object": {
                "definition": {
                    "name": {
                        "en-US": "Example Activity"
                    },
                    "description": {
                        "en-US": "Example activity description"
                    }
                },
                "id": "http://example.adlnet.gov/xapi/example/activity",
                "objectType": "Activity"
            },
            "stored": "2016-01-25T20:10:38.397395+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "e179532e-ae03-4b86-a84f-aea691f1fd13"
        },

        /* 4 Actor IFI Openid - Simple Statement with the Actor IFI openid */
        stmt4: {
            "actor": {
                "openid": "http://user.openid.example.com",
                "objectType": "Agent"
            },
            "verb": {
                "display": {
                    "en-US": "created"
                },
                "id": "http://adlnet.gov/expapi/verbs/created"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:05:53.282478+00:00",
            "object": {
                "definition": {
                    "description": {
                        "en-US": "Example activity description"
                    },
                    "name": {
                        "en-US": "Example Activity"
                    }
                },
                "id": "http://example.adlnet.gov/xapi/example/activity",
                "objectType": "Activity"
            },
            "stored": "2016-01-25T20:05:53.282478+00:00",
            "authority": {
              "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "e038d689-2d58-4068-a8c9-2cd51c8aa4c8"
        },

        /* 5 Actor IFI Account - simple statement with the Actor as an account.
        A user account on an existing system, such as a private system (LMS or
        intranet) or a public system (social networking site).

        Details:
            If the system that provides the account Object uses OpenID, the
        Activity Provider SHOULD use the openid property instead of an account
        Object.
            If the Activity Provider is concerned about revealing personally
        identifiable information about an Agent or Group, it SHOULD use an
        opaque account name (for example an account number) to identify all
        Statements about a person while maintaining anonymity.*/
        stmt5: {
            "actor": {
                "account": {
                    "homePage": "http://www.example.com",
                    "name": "1625378"
                },
                "objectType": "Agent"
            },
            "verb": {
                "display": {
                    "en-US": "created"
                },
                "id": "http://adlnet.gov/expapi/verbs/created"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:00:31.763809+00:00",
            "object": {
                "definition": {
                    "description": {
                        "en-US": "Example activity description"
                    },
                    "name": {
                        "en-US": "Example Activity"
                        }
                },
                "id": "http://example.adlnet.gov/xapi/example/activity",
                "objectType": "Activity"
            },
            "stored": "2016-01-25T20:00:31.763809+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "7a886f8b-e1c6-4470-8f33-54810b5a99e5"
        },

        /* 6 Verb - Simple Statement with user defined verb
        https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#413-verb */
        stmt6: {
            "verb": {
                "display": {
                    "en-US": "perused"
                },
                "id": "http://user.com/xapi/verbs/perused"
            },
            "id": "591122cf-e208-4503-bcdb-279d4a1129a6",
            "version": "1.0.1",
            "timestamp": "2016-01-21T16:35:26.532503+00:00",
            "actor": {
                "openid": "http://user.openid.example.com",
                "objectType": "Agent"
            },
            "object": {
                "definition": {
                    "description": {
                        "en-US": "Example activity description"
                    },
                    "name": {
                        "en-US": "Example Activity"
                    }
                },
                "id": "http://example.adlnet.gov/xapi/example/activity",
                "objectType": "Activity"
            },
            "stored": "2016-01-21T16:35:26.532503+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            }
        },

        /* 7 Verb - Simple Statement with predefined verb */
        stmt7: {
            "verb": {
              "id": "http://adlnet.gov/expapi/verbs/preferred",
                "display": {
                "en-US": "preferred"
                }
            },
            "version": "1.0.1",
            "timestamp": "2016-01-21T16:30:02.244116+00:00",
            "object": {
            "definition": {
                "name": {
                  "en-US": "Example Activity"
                },
                "description": {
                  "en-US": "Example activity description"
                }
                },
                "id": "http://example.adlnet.gov/xapi/example/activity",
                "objectType": "Activity"
            },
            "actor": {
              "openid": "http://user.openid.example.com",
                "objectType": "Agent"
            },
            "stored": "2016-01-21T16:30:02.244116+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "12d33361-b5fe-48dd-ab8c-8777cc9c45a5"
        },

        /* 8 Object - Simple Statment with Object as an Activity
        https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#414-object */
        stmt8: {
            "object": {
                "definition": {
                    "description": {
                        "en-US": "Example activity description"
                    },
                    "name": {
                        "en-US": "Example Activity"
                    }
                },
                "id": "http://example.adlnet.gov/xapi/example/activity",
                "objectType": "Activity"
            },
            "verb": {
                "display": {
                    "en-US": "attempted"
                },
                "id": "http://adlnet.gov/expapi/verbs/attempted"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-21T16:09:30.685861+00:00",
            "actor": {
                "mbox": "mailto:user@example.com",
                "objectType": "Agent"
            },
            "stored": "2016-01-21T16:09:30.685861+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "8d5a014c-0d8d-4bca-be53-d6dba346519b"
        },

        /* 9 Object - Simple Statment with Object as an Agent */
        stmt9: {
            "object": {
                "mbox": "mailto:instructor@example.com",
                "name": "Instructor",
                "objectType": "Agent"
            },
            "verb": {
                "display": {
                    "en-US": "asked"
            },
                "id": "http://adlnet.gov/expapi/verbs/asked"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-21T15:59:29.050208+00:00",
            "actor": {
                "mbox": "mailto:user@example.com",
                "objectType": "Agent"
            },
            "stored": "2016-01-21T15:59:29.050208+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "f3d9ed54-c057-11e5-b464-005056a25e99"
        },

        /* 10 Object - Simple Statement with object as a Group */
        stmt10: {
            "object": {
                "member": [
                    {
                        "account": {
                            "homePage": "http://www.example.com",
                            "name": "13936749"
                        },
                        "name": "Bob",
                        "objectType": "Agent"
                    },
                    {
                        "openid": "http://carol.openid.example.org/",
                        "name": "Carol",
                        "objectType": "Agent"
                    },
                    {
                        "mbox": "mailto:tom@example.com",
                        "name": "Tom",
                        "objectType": "Agent"
                    },
                    {
                        "mbox_sha1sum": "ebd31e95054c018b10727de4db3ef2ec3a016ee9",
                        "name": "Alice",
                        "objectType": "Agent"
                    }
                ],
                "name": "Students",
                "objectType": "Group"
            },
            "verb": {
                "display": {
                    "en-US": "asked"
                },
                "id": "http://adlnet.gov/expapi/verbs/asked"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-21T15:59:29.027893+00:00",
            "actor": {
                "mbox": "mailto:user@example.com",
                "objectType": "Agent"
            },
            "stored": "2016-01-21T15:59:29.027893+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "f3d68632-c057-11e5-b464-005056a25e99"
        },

        /* 11 Object - Simple Statement with Object as a Statement Reference*/
        stmt11: {
            "object": {
                "id": "12345678-1234-5678-1234-567812345678",
                "objectType": "StatementRef"
            },
            "actor": {
                "mbox": "mailto:user@example.com",
                "objectType": "Agent"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/asked",
                "display": {
                  "en-US": "asked"
                }
            },
            "version": "1.0.1",
            "timestamp": "2016-01-21T15:59:29.017173+00:00",
            "stored": "2016-01-21T15:59:29.017173+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "f3d4e214-c057-11e5-b464-005056a25e99"
        },

        /* 6 Verb = attempted, and a Result section */
        stmtA: {
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/attempted",
                "display": {
                    "en-US": "attempted"
                }
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:40:21.350153+00:00",
            "object": {
                "definition": {
                    "name": {
                        "en-US": "simple CBT course"
                    },
                    "description": {
                        "en-US": "A fictitious example CBT course."
                    }
                },
                "id": "http://example.adlnet.gov/xapi/example/simpleCBT",
                "objectType": "Activity"
            },
            "actor": {
                "mbox": "mailto:example.learner@adlnet.gov",
                "name": "Example Learner",
                "objectType": "Agent"
            },
            "stored": "2016-01-25T20:40:21.350153+00:00",
            "result": {
                "completion": true,
                "score": {
                    "scaled": 0.95
                },
                "success": true
            },
            "id": "0c808355-396c-4a3f-9bf2-5334e0f71493",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            }
        },
        /* 3 Simple statement with Object as an Activity */
        stmtB: {
            "verb": {
                "id": "http://verb.com/do0"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:37:36.706944+00:00",
            "object": {
                "definition": {
                    "type": "http://www.example.co.uk/types/exampleactivitytype",
                    "name": {
                        "en-GB": "example activity",
                        "en-US": "example activity"
                    },
                    "description": {
                        "en-GB": "An example of an activity",
                        "en-US": "An example of an activity"
                    }
                },
                "id": "http://www.example.co.uk/exampleactivity",
                "objectType": "Activity"
            },
                "actor": {
                "mbox": "mailto:tom@tom.com",
                "objectType": "Agent"
            },
            "stored": "2016-01-25T20:37:36.706944+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "45f58f16-a6bc-401f-b324-b841a77a6d6f"
        },
        /* 4 Simple statement with Object as an Agent*/
        stmtC: {
            "verb": {
                "id": "http://verb.com/do0"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:35:39.683720+00:00",
            "object": {
                "mbox": "mailto:andrew@example.co.uk",
                "name": "Andrew Downes",
                "objectType": "Agent"
            },
            "actor": {
                "mbox": "mailto:tom@tom.com",
                "objectType": "Agent"
            },
            "stored": "2016-01-25T20:35:39.683720+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "2bf2f7c9-58bb-459e-a50f-42951913b29c"
        },
        /* 5 Simple statement with Object as an identified Group with members */
        stmtD: {
            "object": {
                "member": [
                    {
                        "mbox": "mailto:andrew@example.com",
                        "name": "Andrew Downes",
                        "objectType": "Agent"
                    },
                    {
                        "openid": "http://aaron.openid.example.org",
                        "name": "Aaron Silvers",
                        "objectType": "Agent"
                    }
                ],
                "account": {
                    "homePage": "http://example.com/homePage",
                    "name": "GroupAccount"
                },
                "name": "Example Group",
                "objectType": "Group"
            },
            "verb": {
                "id": "http://verb.com/do0"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:31:57.460856+00:00",
            "actor": {
                "mbox": "mailto:tom@tom.com",
                "objectType": "Agent"
            },
            "stored": "2016-01-25T20:31:57.460856+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "537e8b66-0598-4067-bb2d-de8c4e072049"
        },
        /* 6 Simple statement with Object as a Sub-Statement whose Object is a Statement Reference*/
        stmtE: {
            "verb": {
                "id": "http://verb.com/do0"
            },
            "version": "1.0.1",
            "timestamp": "2016-01-25T20:28:19.597807+00:00",
            "object": {
                "verb": {
                    "id": "http://example.com/confirmed",
                    "display": {
                        "en": "confirmed"
                    }
                },
                "actor": {
                    "mbox": "mailto:agent@example.com",
                    "objectType": "Agent"
                },
                "object": {
                    "id": "9e13cefd-53d3-4eac-b5ed-2cf6693903bb",
                    "objectType": "StatementRef"
                },
                "objectType": "SubStatement"
            },
            "actor": {
                "mbox": "mailto:tom@tom.com",
                "objectType": "Agent"
            },
            "stored": "2016-01-25T20:28:19.597807+00:00",
            "authority": {
                "mbox": "mailto:tyler.mulligan.ctr+xapi-tools@adlnet.gov",
                "name": "xapi-tools",
                "objectType": "Agent"
            },
            "id": "b5f9eb2c-588f-48b0-b845-71ed17cd074e"
        },
        /* 7 A long example statement showcasing most of the properties available. This example shows a statement returned by an LRS including the authority and stored properties set by the LRS */
        stmtF: {
            "id": "6690e6c9-3ef0-4ed3-8b37-7f3964730bee",
            "actor": {
                "name": "Team PB",
                "mbox": "mailto:teampb@example.com",
                "member": [
                    {
                        "name": "Andrew Downes",
                        "account": {
                            "homePage": "http://www.example.com",
                            "name": "13936749"
                        },
                        "objectType": "Agent"
                    },
                    {
                        "name": "Toby Nichols",
                        "openid": "http://toby.openid.example.org/",
                        "objectType": "Agent"
                    },
                    {
                        "name": "Ena Hills",
                        "mbox_sha1sum": "ebd31e95054c018b10727ccffd2ef2ec3a016ee9",
                        "objectType": "Agent"
                    }
                ],
                "objectType": "Group"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/attended",
                "display": {
                    "en-GB": "attended",
                    "en-US": "attended"
                }
            },
            "result": {
                "extensions": {
                    "http://example.com/profiles/meetings/resultextensions/minuteslocation": "X:\\meetings\\minutes\\examplemeeting.one"
                },
                "success": true,
                "completion": true,
                "response": "We agreed on some example actions.",
                "duration": "PT1H0M0S"
            },
            "context": {
                "registration": "ec531277-b57b-4c15-8d91-d292c5b2b8f7",
                "contextActivities": {
                    "parent": [
                        {
                            "id": "http://www.example.com/meetings/series/267",
                            "objectType": "Activity"
                        }
                    ],
                    "category": [
                        {
                            "id": "http://www.example.com/meetings/categories/teammeeting",
                            "objectType": "Activity",
                            "definition": {
                                "name": {
                                    "en": "team meeting"
                                },
                                "description": {
                                    "en": "A category of meeting used for regular team meetings."
                                },
                                "type": "http://example.com/expapi/activities/meetingcategory"
                            }
                        }
                    ],
                    "other": [
                        {
                            "id": "http://www.example.com/meetings/occurances/34257",
                            "objectType": "Activity"
                        },
                        {
                            "id": "http://www.example.com/meetings/occurances/3425567",
                            "objectType": "Activity"
                        }
                    ]
                },
                "instructor" :
                {
                    "name": "Andrew Downes",
                    "account": {
                        "homePage": "http://www.example.com",
                        "name": "13936749"
                    },
                    "objectType": "Agent"
                },
                "team":
                {
                    "name": "Team PB",
                    "mbox": "mailto:teampb@example.com",
                    "objectType": "Group"
                },
                "platform" : "Example virtual meeting software",
                "language" : "tlh",
                "statement" : {
                    "objectType":"StatementRef",
                    "id" :"6690e6c9-3ef0-4ed3-8b37-7f3964730bee"
                }

            },
            "timestamp": "2013-05-18T05:32:34.804Z",
            "stored": "2013-05-18T05:32:34.804Z",
            "authority": {
                "account": {
                    "homePage": "http://cloud.scorm.com/",
                    "name": "anonymous"
                },
                "objectType": "Agent"
            },
            "version": "1.0.0",
            "object": {
                "id": "http://www.example.com/meetings/occurances/34534",
                "definition": {
                    "extensions": {
                        "http://example.com/profiles/meetings/activitydefinitionextensions/room": {"name": "Kilby", "id" : "http://example.com/rooms/342"}
                    },
                    "name": {
                        "en-GB": "example meeting",
                        "en-US": "example meeting"
                    },
                    "description": {
                        "en-GB": "An example meeting that happened on a specific occasion with certain people present.",
                        "en-US": "An example meeting that happened on a specific occasion with certain people present."
                    },
                    "type": "http://adlnet.gov/expapi/activities/meeting",
                    "moreInfo": "http://virtualmeeting.example.com/345256"
                },
                "objectType": "Activity"
            }
        },
    }
})(this);
