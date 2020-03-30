<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>Rapport par personnel</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" sm="6" md="3">
                                <v-autocomplete
                                    :items="users"
                                    v-model="selectedUser"
                                    label="Personnel"
                                    :item-text="e => `${e.firstname} ${e.lastname}`"
                                    item-key="id"
                                    return-object
                                ></v-autocomplete>
                            </v-col>
                            <v-col cols="12" sm="6" md="2">
                                <v-autocomplete
                                    :items="types"
                                    label="Type de don"
                                    v-model="formFilter.type"
                                    item-text="text"
                                    item-value="value"
                                ></v-autocomplete>
                            </v-col>
                            <v-col cols="12" sm="6" md="2">
                                <v-autocomplete
                                    :items="status"
                                    label="Statut"
                                    v-model="formFilter.status"
                                    item-text="text"
                                    item-value="value"
                                ></v-autocomplete>
                            </v-col>
                            <v-col cols="12" sm="6" md="2">
                                <v-autocomplete
                                    :items="status_usage"
                                    label="Statut opérationnel"
                                    v-model="formFilter.status_usage"
                                    item-text="text"
                                    item-value="value"
                                ></v-autocomplete>
                            </v-col>
                            <v-col cols="2" v-if="selectedUser">
                                <v-btn color="primary" @click="downloadXLS">Télécharger Excel</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-data-table
                                    :headers="headers"
                                    :items="filteredDonations"
                                    hide-default-footer
                                    class="elevation-1"
                                    item-key="id"
                                >
                                    <template
                                        v-slot:item.status="{ item }"
                                    >{{ item.status | statusLabel }}</template>
                                    <template v-slot:item.contact="{ item }">
                                        <br />
                                        {{ item.contact }}
                                        <template
                                            v-if="item.role"
                                        >({{ item.role }})</template>
                                        <br />
                                        <a
                                            :href="`mailto:${item.email}`"
                                            target="_blank"
                                        >{{ item.email }}</a>
                                        <br />
                                        <a :href="`tel:${item.phone1}`">{{ item.phone1 }}</a>
                                        <br />
                                        <br />
                                    </template>
                                    <template
                                        v-slot:item.pledgDate="{ item }"
                                    >{{ item.pledgDate | dateHuman }}</template>
                                    <template
                                        v-slot:item.plannedDeliveryDate="{ item }"
                                    >{{ item.plannedDeliveryDate | dateHuman }}</template>
                                    <template v-slot:item.donation="{ item }">
                                        <template v-if="item.measurable">{{ item.quantity }}</template>
                                        {{ item.unit }}
                                    </template>

                                    <template v-slot:item.recipients="{ item }">
                                        <v-autocomplete
                                            :items="item.repartitions"
                                            label="Répartition"
                                            :item-text="e => `${e.recipient.name} (${e.quantity})`"
                                            item-key="id"
                                        ></v-autocomplete>
                                    </template>
                                </v-data-table>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import gql from "graphql-tag";
import moment from "moment";
import { json2excel } from "js2excel";

import { statusLabel } from "@/helpers";

export default {
    name: "ReportBySite",
    data() {
        return {
            selectedUser: null,
            formFilter: {
                type: "",
                status: "",
                status_usage: ""
            },
            headers: [
                { text: "Donateur", value: "donor" },
                { text: "Don", value: "donation", sortable: false },
                { text: "Destinataires", value: "recipients" },
                { text: "Commentaire", value: "comment" }
            ],
            types: [
                { text: "Tous", value: "" },
                { text: "Alimentation", value: "food" },
                { text: "Compétences-RH", value: "hr" },
                { text: "Bien-être", value: "wellbeing" },
                { text: "Transport", value: "transport" },
                { text: "Hébergement", value: "hosting" },
                { text: "Autre", value: "others" }
            ],
            status: [
                { text: "Tous", value: "" },
                { text: "Promesse de don", value: "pledg" },
                { text: "Réceptionné APHP", value: "received" },
                { text: "Distribué", value: "distributed" }
            ],
            status_usage: [
                { text: "Tous", value: "" },
                { text: "À traiter", value: "tobeprocessed" },
                { text: "Traitement en cours", value: "processing" },
                { text: "Traité", value: "processed" }
            ]
        };
    },
    apollo: {
        users: gql`
            query {
                users {
                    id
                    firstname
                    lastname
                }
            }
        `,
        donations: {
            query: gql`
                query($userID: ID!) {
                    donations(where: { user: $userID }) {
                        id
                        donor
                        contact
                        role
                        email
                        phone1
                        phone2
                        type
                        comment
                        measurable
                        quantity
                        unit
                        receivedAPHP
                        plannedDeliveryDate
                        status
                        status_usage
                        pledgDate

                        repartitions {
                            id
                            quantity
                            recipient {
                                id
                                name
                            }
                        }
                    }
                }
            `,
            skip() {
                return this.selectedUser === null;
            },
            variables() {
                return {
                    userID: this.selectedUser.id
                };
            }
        }
    },
    computed: {
        filteredDonations() {
            if (!this.donations) return [];

            return this.donations.filter(
                e =>
                    e.type.indexOf(this.formFilter.type) != -1 &&
                    e.status.indexOf(this.formFilter.status) != -1 &&
                    e.status_usage.indexOf(this.formFilter.status_usage) != -1
            );
        }
    },

    methods: {
        downloadXLS() {
            let data = this.filteredDonations.map(e => ({
                "Statut du don": this.$options.filters.statusLabel(e.status),
                Donateur: e.donor,
                Contact: e.contact,
                Role: e.role,
                Email: e.email,
                Don: `${e.measurable ? e.quantity + " " : ""}${e.unit}`,
                "Date promesse": e.pledgDate,
                "Date livraison": e.plannedDeliveryDate,
                Commentaire: e.comment
            }));

            try {
                json2excel({
                    data,
                    name: `${moment().format("YYYYMMDD-HHmm")} ${
                        this.selectedUser.lastname
                    }`.substring(0, 30),
                    formateDate: "dd/mm/yyyy"
                });
            } catch (e) {
                console.error("export error");
            }
        }
    },

    filters: {
        dateHuman: function(date) {
            return moment(date).format("dddd DD/MM/YYYY");
        },
        statusLabel: function(status) {
            return statusLabel(status);
        }
    }
};
</script>
