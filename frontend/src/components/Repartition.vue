<template>
    <v-dialog
        v-model="showDialog"
        max-width="900"
        :persistent="true"
        :fullscreen="$vuetify.breakpoint.mdAndDown"
        scrollable
    >
        <v-card>
            <v-card-title>Répartition du don</v-card-title>
            <v-card-text>
                <v-row fluid>
                    <v-col cols="12" v-if="donation">
                        Quantité restante :
                        <b>{{ remainingQuantity }} ({{ donation.unit }})</b>
                    </v-col>
                </v-row>
                <v-row fluid>
                    <v-col cols="12">
                        <v-data-table
                            :headers="headers"
                            :items="repartitions"
                            hide-default-footer
                            class="elevation-1"
                            item-key="id"
                        >
                            <template v-slot:item.quantity="{ item }">
                                <v-text-field
                                    type="number"
                                    v-model.number="item.quantity"
                                    @change="updateQuantity(item.id)"
                                    required
                                ></v-text-field>
                            </template>

                            <template v-slot:item.recipient="{ item }">
                                <v-autocomplete
                                    :items="recipients"
                                    v-model="item.recipient"
                                    item-text="name"
                                    item-key="id"
                                    return-object
                                    @change="updateRecipient(item.id)"
                                ></v-autocomplete>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn color="error" @click="deleteRepartition(item.id)">Supprimer</v-btn>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" text @click="addSite">Ajouter un site</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="$emit('update:dialog', false)">Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import gql from "graphql-tag";
import debounce from "lodash.debounce";

export default {
    name: "Repartition",
    props: ["dialog", "donationID"],
    data() {
        return {
            showDialog: false,
            repartitions: [],
            headers: [
                { text: "Site", value: "recipient" },
                { text: "Quantité", value: "quantity" },
                { text: "Don", value: "donation.unit", sortable: false },
                { text: "Donateur", value: "donation.donor", sortable: false },
                { text: "Actions", value: "actions", sortable: false }
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
        donation: {
            query: gql`
                query($id: ID!) {
                    donation(id: $id) {
                        id
                        donor
                        contact
                        quantity
                        unit
                    }
                }
            `,
            skip() {
                return this.donationID === null;
            },
            variables() {
                return {
                    id: this.donationID
                };
            }
        }
    },
    computed: {
        remainingQuantity() {
            if (!this.donation) {
                return 0;
            }
            const total = this.repartitions.reduce(
                (acc, e) => acc + e.quantity,
                0
            );
            return this.donation.quantity - total;
        }
    },
    watch: {
        async dialog() {
            this.showDialog = this.dialog;

            if (this.showDialog && this.donationID) {
                // ...
                const {
                    data: { donationRepartitions: repartitions }
                } = await this.$apollo.query({
                    query: gql`
                        query($donationID: ID!) {
                            donationRepartitions(
                                where: { donation: { id: $donationID } }
                            ) {
                                id
                                quantity
                                recipient {
                                    id
                                    name
                                }
                                donation {
                                    id
                                    donor
                                    contact
                                    quantity
                                    unit
                                }
                            }
                        }
                    `,
                    variables: {
                        donationID: this.donationID
                    }
                });
                this.repartitions = repartitions;
            }
        }
    },
    methods: {
        updateQuantity: debounce(function(id) {
            console.log(id);
            this.$apollo.mutate({
                mutation: gql`
                    mutation($id: ID!, $qty: Int!) {
                        updateDonationRepartition(
                            input: {
                                where: { id: $id }
                                data: { quantity: $qty }
                            }
                        ) {
                            donationRepartition {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    id,
                    qty: this.repartitions.find(e => e.id === id).quantity
                }
            });
        }, 1000),
        updateRecipient: debounce(function(id) {
            this.$apollo.mutate({
                mutation: gql`
                    mutation($id: ID!, $recipientID: ID!) {
                        updateDonationRepartition(
                            input: {
                                where: { id: $id }
                                data: { recipient: $recipientID }
                            }
                        ) {
                            donationRepartition {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    id,
                    recipientID: this.repartitions.find(e => e.id === id)
                        .recipient.id
                }
            });
        }, 1000),

        async addSite() {
            const { data: { createDonationRepartition: { donationRepartition } } } = await this.$apollo.mutate({
                mutation: gql`
                    mutation($donationID: ID!) {
                        createDonationRepartition(
                            input: {
                                data: {
                                    donation: $donationID
                                    quantity: 0
                                }
                            }
                        ) {
                            donationRepartition {
                                id
                                quantity
                                recipient {
                                    id
                                    name
                                }
                                donation {
                                    id
                                    donor
                                    contact
                                    quantity
                                    unit
                                }
                            }
                        }
                    }
                `,
                variables: {
                    donationID: this.donationID
                }
            });
            this.repartitions.push(donationRepartition)
        },

        async deleteRepartition(id) {
            await this.$apollo.mutate({
                mutation: gql`
                    mutation($id: ID!) {
                        deleteDonationRepartition(
                            input: {
                                where: { id: $id }
                            }
                        ) {
                            donationRepartition {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    id
                }
            });
            this.repartitions.splice(this.repartitions.findIndex(e => e.id === id), 1)
        }
    }
};
</script>
