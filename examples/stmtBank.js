/*
A store of all permutations of valid xapi statements and malformed statements for testing and coverage purposes.  Please use as needed.

https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md
*/
(function (obj) {
    var ADL = obj;
    if (typeof window !== 'undefined') {
        ADL = window.ADL = obj.ADL || {};
    }
    ADL.stmts = {
        /* 0 Simplest possible statement - Actor-Verb-Object */
        stmt0: {
        	"actor": {
        		"mbox": "mailto:tom@tom.com"
        	},
        	"verb": {
        		"id": "http://verb.com/do0"
        	},
        	"object": {
        		"id": "http://from.tom/act0"
        	}
        },
        /* 1 Simple statement featured at the xapi specify https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#AppendixA
        features Actor-Verb-Object with UUID */
        stmt1: {
            "id":"fd41c918-b88b-4b20-a0a5-a4c32391aaa0",
            "actor":{
                "objectType": "Agent",
                "name":"Project Tin Can API",
                "mbox":"mailto:user@example.com"
            },
            "verb":{
                "id":"http://adlnet.gov/expapi/verbs/created",
                "display":{
                    "en-US":"created"
                }
            },
            "object":{
                "id":"http://example.adlnet.gov/xapi/example/simplestatement",
                "definition":{
                    "name":{
                        "en-US":"simple statement"
                    },
                    "description":{
                        "en-US":"A simple Experience API statement. Note that the LRS does not need to have any prior information about the Actor (learner), the verb, or the Activity/object."
                    }
                }
            }
        },
        /* 2 Verb = attempted, and a Result section */
        stmt2: {
            "actor":{
                "objectType": "Agent",
                "name":"Example Learner",
                "mbox":"mailto:example.learner@adlnet.gov"
            },
            "verb":{
                "id":"http://adlnet.gov/expapi/verbs/attempted",
                "display":{
                    "en-US":"attempted"
                }
            },
            "object":{
                "id":"http://example.adlnet.gov/xapi/example/simpleCBT",
                "definition":{
                    "name":{
                        "en-US":"simple CBT course"
                    },
                    "description":{
                        "en-US":"A fictitious example CBT course."
                    }
                }
            },
            "result":{
                "score":{
                    "scaled":0.95
                },
                "success":true,
                "completion":true
            }
        },
        /* 3 Simple statement with Object as an Activity */
        stmt3: {
            "actor": {
        		"mbox": "mailto:tom@tom.com"
        	},
        	"verb": {
        		"id": "http://verb.com/do0"
        	},
            "object": {
                "id": "http://www.example.co.uk/exampleactivity",
                "definition": {
                    "name": {
                        "en-GB": "example activity",
                        "en-US": "example activity"
                    },
                    "description": {
                        "en-GB": "An example of an activity",
                        "en-US": "An example of an activity"
                    },
                    "type": "http://www.example.co.uk/types/exampleactivitytype"
                },
                "objectType": "Activity"
            }
        },
        /* 4 Simple statement with Object as an Agent*/
        stmt4: {
            "actor": {
                "mbox": "mailto:tom@tom.com"
            },
            "verb": {
                "id": "http://verb.com/do0"
            },
            "object": {
                "name": "Andrew Downes",
                "mbox": "mailto:andrew@example.co.uk",
                "objectType": "Agent"
            },
        },
        /* 5 Simple statement with Object as an identified Group with members */
        stmt5:{
            "actor": {
                "mbox": "mailto:tom@tom.com"
            },
            "verb": {
                "id": "http://verb.com/do0"
            },
            "object": {
                "name": "Example Group",
                "account" : {
                    "homePage" : "http://example.com/homePage",
                    "name" : "GroupAccount"
                },
                "objectType": "Group",
                "member": [
                    {
                        "name": "Andrew Downes",
                        "mbox": "mailto:andrew@example.com",
                        "objectType": "Agent"
                    },
                    {
                        "name": "Aaron Silvers",
                        "openid": "http://aaron.openid.example.org",
                        "objectType": "Agent"
                    }
                ]
            }
        },
        /* 6 Simple statement with Object as a Sub-Statement whose Object is a Statement Reference*/
        stmt6: {
            "actor": {
                "mbox": "mailto:tom@tom.com"
            },
            "verb": {
                "id": "http://verb.com/do0"
            },
            "object": {
                "objectType": "SubStatement",
                "actor" : {
                    "objectType": "Agent",
                    "mbox":"mailto:agent@example.com"
                },
                "verb" : {
                    "id":"http://example.com/confirmed",
                    "display":{
                        "en":"confirmed"
                    }
                },
                "object": {
                    "objectType":"StatementRef",
                    "id" :"9e13cefd-53d3-4eac-b5ed-2cf6693903bb"
                }
            }
        },
        /* 7 A long example statement showcasing most of the properties available. This example shows a statement returned by an LRS including the authority and stored properties set by the LRS */
        stmt7 : {
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
