<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>Rapport par établissement</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" sm="6" md="3">
                                <v-autocomplete
                                    :items="GHUS"
                                    v-model="formFilter.GHU"
                                    label="GHU"
                                    item-text="text"
                                    item-key="value"
                                ></v-autocomplete>
                            </v-col>
                            <v-col cols="12" sm="6" md="3">
                                <v-autocomplete
                                    :items="recipients"
                                    v-model="selectedRecipient"
                                    label="Établissement"
                                    item-text="name"
                                    item-key="id"
                                    return-object
                                    clearable
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
                            <v-col cols="2">
                                <v-btn color="primary" @click="downloadXLS">Télécharger Excel</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-data-table
                                    :headers="headers"
                                    :items="donations"
                                    class="elevation-1"
                                    item-key="id"
                                >
                                    <template
                                        v-slot:item.status="{ item }"
                                    >{{ item.status | statusLabel }}</template>
                                    <template v-slot:item.contact="{ item }">
                                        <br />{{ item.contact }}
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
                                        <br /><br />
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
import moment from "moment"
import { json2excel } from 'js2excel';

import { statusLabel } from "@/helpers"

export default {
    name: "ReportBySite",
    data() {
        return {
            selectedRecipient: null,
            formFilter: {
                type: "",
                status: "",
                status_usage: "",
                GHU: ""
            },
            headers: [
                { text: "GHU", value: "GHU" },
                { text: "Site", value: "recipient_name" },
                { text: "Services", value: "services" },
                { text: "Donateur", value: "donor" },
                { text: "Don", value: "donation", sortable: false },
                { text: "Date livraison", value: "plannedDeliveryDate" }
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
            ],
            GHUS: [
                { text: "Tous", value: "" },
                { text: "GHU PSSD", value: "GHU_PSSD" },
                { text: "GHU Paris Nord", value: "GHU_Paris_Nord" },
                { text: "GHU Paris Centre", value: "GHU_Paris_Centre" },
                { text: "GHU Paris Sorbonne", value: "GHU_Paris_Sorbonne" },
                { text: "GHU Paris Saclay", value: "GHU_Paris_Saclay" },
                { text: "GHU HM", value: "GHU_HM" },
                { text: "Autre", value: "Autre" }
            ]
        };
    },
    apollo: {
        recipients: gql`
            query {
                recipients {
                    id
                    name
                }
            }
        `,
        donationRepartitions: {
            query: gql`
                query {
                    donationRepartitions {
                        id
                        quantity
                        GHU
                        services
                        recipient {
                            id
                            name
                        }
                        donation {
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
                        }
                    }
                }
            `
        }
    },
    computed: {
        donations() {
            if (!this.donationRepartitions) return []

            return this.donationRepartitions
                .filter(e =>
                    (!e.GHU || e.GHU.indexOf(this.formFilter.GHU) != -1) &&
                    (!e.recipient || e.recipient.id === (this.selectedRecipient ? this.selectedRecipient.id : e.recipient.id)) &&
                    e.donation.type.indexOf(this.formFilter.type) != -1 &&
                    e.donation.status.indexOf(this.formFilter.status) != -1 &&
                    e.donation.status_usage.indexOf(this.formFilter.status_usage) != -1
                )
                .map(e => ({
                    ...e.donation,
                    quantity: e.quantity,
                    GHU: e.GHU ? e.GHU.replace(/_/g, " ") : "",
                    services: e.services,
                    recipient_name: e.recipient ? e.recipient.name : ""
                }))
        }
    },

    methods: {
        downloadXLS() {
            let data = this.donations.map(e => ({
                GHU: e.GHU,
                Site: e.recipient_name,
                Services: e.services,
                Donateur: e.donor,
                Don: `${e.measurable ? e.quantity + " " : ""}${e.unit}`,
                "Date livraison": e.plannedDeliveryDate
            }));

            try {
                json2excel({
                    data,
                    name: `${moment().format("YYYYMMDD-HHmm")} ${this.formFilter.GHU}${this.selectedRecipient ? " "+this.selectedRecipient.name: ""}`.substring(0, 30),
                    formateDate: "dd/mm/yyyy"
                });
            } catch (e) {
                console.error("export error", e);
            }
        }
    },

    filters: {
        dateHuman: function(date) {
            return date ? moment(date).format("dddd DD/MM/YYYY") : "";
        },
        statusLabel: function(status) {
            return statusLabel(status)
        }
    }
};
</script>
