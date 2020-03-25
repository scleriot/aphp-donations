<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-btn color="success" @click="addNewDonation">Ajouter un nouveau don</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                    :headers="headers"
                    :items="donations"
                    hide-default-footer
                    class="elevation-1"
                    item-key="id"
                >
                    <template v-slot:item.status="{ item }">
                        {{ item.status | statusLabel }}
                    </template>
                    <template v-slot:item.contact="{ item }">
                        {{ item.contact }}
                        <template v-if="item.role">({{ item.role }})</template>
                        <br />
                        <a :href="`mailto:${item.email}`" target="_blank">{{ item.email }}</a>
                        <br />
                        <a :href="`tel:${item.phone1}`">{{ item.phone1 }}</a>
                        <br />
                    </template>
                    <template v-slot:item.pledgDate="{ item }">{{ item.pledgDate | dateHuman }}</template>
                    <template v-slot:item.plannedDeliveryDate="{ item }">{{ item.plannedDeliveryDate | dateHuman }}</template>
                    <template v-slot:item.donation="{ item }">
                        <template v-if="item.measurable">{{ item.quantity }}</template>
                        {{ item.unit }}
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-btn color="warning" @click="edit(item.id)">Éditer</v-btn> &nbsp;
                        <v-btn v-if="item.status !== 'pledg'" color="success" @click="repartition(item.id)">Répartir</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>

        <donation-edition :id="editionID" :dialog.sync="showEditionDialog"></donation-edition>
        <repartition :donationID="repartitionDonationID" :dialog.sync="showRepartitionDialog"></repartition>
    </v-container>
</template>

<script>
import gql from "graphql-tag";
import moment from "moment";

import DonationEdition from "@/components/DonationEdition.vue";
import Repartition from "@/components/Repartition.vue"
import { statusLabel } from "@/helpers"

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
            headers: [
                { text: "Statut du don", value: "status" },
                { text: "Donateur", value: "donor" },
                { text: "Contact", value: "contact" },
                { text: "Don", value: "donation", sortable: false },
                { text: "Date promesse", value: "pledgDate" },
                { text: "Date livraison", value: "plannedDeliveryDate" },
                { text: "Commentaire", value: "comment" },
                { text: "Actions", value: "actions", sortable: false }
            ]
        };
    },
    apollo: {
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
                }
            }
        `
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
            this.repartitionDonationID = id
            this.showRepartitionDialog = true
        },
        updateDelivery(item) {
            this.$apollo.mutate({
                mutation: gql`mutation($id: ID!, $delivered: Boolean!) {
                    updateDonation(input: {
                        where: {
                            id: $id
                        }
                        data: {
                            receivedAPHP: $delivered
                        }
                    }) { donation { id receivedAPHP } }
                }`,
                variables: {
                    id: item.id,
                    delivered: item.receivedAPHP
                }
            })
        }
    },
    filters: {
        dateHuman: function(date) {
            return moment(date).format("dddd DD/MM/YYYY");
        },
        statusLabel: function(status) {
            return statusLabel(status)
        }
    }
};
</script>
