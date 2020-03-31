<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" md="4" lg="3">
                <v-btn color="primary" @click="addNewDonation" outlined>Ajouter un nouveau don</v-btn>
            </v-col>
            <v-col cols="12" md="4" lg="3">
                <v-btn color="primary" @click="downloadXLS">Télécharger Excel</v-btn>
            </v-col>
        </v-row>
        <v-row>
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
            <v-col cols="12" sm="6" md="2">
                <v-autocomplete
                    :items="userList"
                    label="Personne"
                    v-model="formFilter.user"
                    item-text="text"
                    item-value="value"
                ></v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6" md="2">
                <v-text-field
                    v-model="formFilter.donor"
                    label="Donateur"
                    required
                    clearable
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                    :headers="headers"
                    :items="filteredDonations"
                    :options.sync="tableOptions"
                    class="elevation-1"
                    item-key="id"
                >
                    <template v-slot:item.status="{ item }">{{ item.status | statusLabel }}</template>
                    <template v-slot:item.contact="{ item }">
                        <br />
                        {{ item.contact }}
                        <template v-if="item.role">({{ item.role }})</template>
                        <br />
                        <a :href="`mailto:${item.email}`" target="_blank">{{ item.email }}</a>
                        <br />
                        <a :href="`tel:${item.phone1}`">{{ item.phone1 }}</a>
                        <br />
                        <br />
                    </template>
                    <template v-slot:item.pledgDate="{ item }">{{ item.pledgDate | dateHuman }}</template>
                    <template
                        v-slot:item.plannedDeliveryDate="{ item }"
                    >{{ item.plannedDeliveryDate | dateHuman }}</template>
                    <template v-slot:item.donation="{ item }">
                        <template v-if="item.measurable">{{ item.quantity }}</template>
                        {{ item.unit }}
                    </template>
                    <template
                        v-slot:item.status_usage="{ item }"
                    >{{ item.status_usage | statusUsageLabel }}</template>
                    <template
                        v-slot:item.owner="{ item }"
                    >
                        <template v-if="item.user">{{ item.user.firstname }} {{ item.user.lastname }}</template>
                    </template>
                    <template v-slot:item.taxExemptionGiven="{ item }">
                        <template v-if="item.taxExemptionGiven">Oui</template>
                        <template v-else>Non</template>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <br />
                        <v-btn color="primary" @click="edit(item.id)" style="margin-bottom: 5px; margin-right: 5px;">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn color="primary" @click="repartition(item.id)" outlined style="margin-bottom: 5px">Répartir</v-btn>
                        <br /><br />
                    </template>
                </v-data-table>
            </v-col>
        </v-row>

        <donation-edition
            :id="editionID"
            :dialog.sync="showEditionDialog"
            @donation-delete="onDeleteDonation"
            @donation-add="onAddDonation"
        ></donation-edition>
        <repartition :donationID="repartitionDonationID" :dialog.sync="showRepartitionDialog"></repartition>
    </v-container>
</template>

<script>
import gql from "graphql-tag";
import moment from "moment";
import { json2excel } from "js2excel";

import DonationEdition from "@/components/DonationEdition.vue";
import Repartition from "@/components/Repartition.vue";
import { statusLabel, statusUsageLabel } from "@/helpers";

export default {
    name: "Home",
    components: {
        DonationEdition,
        Repartition
    },
    data() {
        return {
            editionID: null,
            showEditionDialog: false,
            repartitionDonationID: null,
            showRepartitionDialog: false,
            formFilter: {
                type: "",
                status: "",
                status_usage: "",
                user: null,
                donor: ""
            },
            tableOptions: {
                page: 0
            },
            users: [],
            headers: [
                { text: "Donateur", value: "donor" },
                { text: "Don", value: "donation", sortable: false },
                { text: "Statut du don", value: "status" },
                {
                    text: "Date de réception prévue",
                    value: "plannedDeliveryDate"
                },
                { text: "Personne en charge", value: "owner", sortable: false },
                { text: "Statut du traitement", value: "status_usage" },
                { text: "Actions", value: "actions", sortable: false },
                {
                    text: "Justificatif défiscalisation donné ?",
                    value: "taxExemptionGiven"
                }
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
        donations: gql`
            query {
                donations {
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
                    taxExemptionGiven
                    user {
                        id
                        firstname
                        lastname
                    }
                }
            }
        `
    },
    computed: {
        filteredDonations() {
            if (!this.donations) return [];

            return this.donations.filter(
                e =>
                    (!this.formFilter.user || e.user && e.user.id === this.formFilter.user) &&
                    e.type.indexOf(this.formFilter.type) != -1 &&
                    e.status.indexOf(this.formFilter.status) != -1 &&
                    e.status_usage.indexOf(this.formFilter.status_usage) != -1 &&
                    (!this.formFilter.donor || e.donor.indexOf(this.formFilter.donor) != -1)
            );
        },
        userList() {
            return [
                { text: "Tous", value: null },
                ...this.users.map(e => ({ text: `${e.firstname} ${e.lastname}`, value: e.id }))
            ]
        }
    },
    watch: {
        showRepartitionDialog() {
            if(!this.showRepartitionDialog) this.repartitionDonationID = null
        },
        filteredDonations() {
            this.tableOptions.page = 0
        }
    },
    methods: {
        addNewDonation() {
            this.editionID = null;
            this.showEditionDialog = true;
        },
        edit(id) {
            this.editionID = id;
            this.showEditionDialog = true;
        },
        repartition(id) {
            this.repartitionDonationID = id;
            this.showRepartitionDialog = true;
        },
        updateDelivery(item) {
            this.$apollo.mutate({
                mutation: gql`
                    mutation($id: ID!, $delivered: Boolean!) {
                        updateDonation(
                            input: {
                                where: { id: $id }
                                data: { receivedAPHP: $delivered }
                            }
                        ) {
                            donation {
                                id
                                receivedAPHP
                            }
                        }
                    }
                `,
                variables: {
                    id: item.id,
                    delivered: item.receivedAPHP
                }
            });
        },
        downloadXLS() {
            let data = this.filteredDonations.map(e => ({
                "Statut du don": this.$options.filters.statusLabel(e.status),
                Donateur: e.donor,
                Contact: e.contact,
                Role: e.role,
                Email: e.email,
                Telephone1: e.telephone1,
                Telephone2: e.telephone2,
                "Type de don": this.types.find(t => t.value === e.type).text,
                Don: `${e.measurable ? e.quantity + " " : ""}${e.unit}`,
                "Date promesse": e.pledgDate,
                "Date livraison": e.plannedDeliveryDate,
                "Statut du traitement": this.$options.filters.statusUsageLabel(e.status_usage),
                "Personne en charge": e.user ? `${e.user.firstname} ${e.user.lastname}` : "",
                "Justificatif de défiscalisation donné ?": e.taxExemptionGiven ? "Oui" : "Non",
                Commentaire: e.comment
            }));

            try {
                json2excel({
                    data,
                    name: `${moment().format(
                        "YYYYMMDD-HHmm"
                    )} Donations`.substring(0, 30),
                    formateDate: "dd/mm/yyyy"
                });
            } catch (e) {
                console.error("export error");
            }
        },

        onDeleteDonation(id) {
            this.donations.splice(
                this.donations.findIndex(e => e.id === id),
                1
            );
        },

        onAddDonation(donation) {
            this.donations.splice(0, 0, { ...donation });
        }
    },
    filters: {
        dateHuman: function(date) {
            return date ? moment(date).format("dddd DD/MM/YYYY") : "";
        },
        statusLabel: function(status) {
            return statusLabel(status);
        },
        statusUsageLabel: function(status) {
            return statusUsageLabel(status);
        }
    }
};
</script>
