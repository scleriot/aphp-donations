<template>
    <v-dialog
        v-model="showDialog"
        max-width="900"
        :persistent="true"
        :fullscreen="$vuetify.breakpoint.mdAndDown"
        scrollable
    >
        <v-card>
            <v-card-title>Donation</v-card-title>
            <v-card-text>
                <v-row fluid>
                    <v-col cols="12">
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="form.donor" label="Donateur" required></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="form.contact"
                                    label="Personne de contact"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model="form.role" label="Fonction" required></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model="form.email" label="Email" required></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field v-model="form.phone1" label="Téléphone 1" required></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field v-model="form.phone2" label="Téléphone 2" required></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="4">
                                <v-autocomplete
                                    :items="types"
                                    label="Type de don"
                                    v-model="form.type"
                                    item-text="text"
                                    item-value="value"
                                ></v-autocomplete>
                            </v-col>
                            <v-col cols="2">
                                <v-checkbox v-model="form.measurable" label="Quantifiable"></v-checkbox>
                            </v-col>
                            <v-col cols="2" v-if="form.measurable">
                                <v-text-field
                                    type="number"
                                    v-model.number="form.quantity"
                                    label="Quantité"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col :cols="form.measurable ? 4 : 6">
                                <v-text-field
                                    v-model="form.unit"
                                    :label="form.measurable ? 'Unité (\'sachet de thé\')' : 'Type de don (Livraison offerte)' "
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="4">
                                <v-menu
                                    ref="menuDate"
                                    v-model="menuDatePledg"
                                    :close-on-content-click="false"
                                    :return-value.sync="form.pledgDate"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                            v-model="form.pledgDate"
                                            label="Date de l'offre"
                                            readonly
                                            v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="form.pledgDate" no-title scrollable>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            text
                                            color="primary"
                                            @click="menuDatePledg = false"
                                        >Cancel</v-btn>
                                        <v-btn
                                            text
                                            color="primary"
                                            @click="$refs.menuDate.save(form.pledgDate)"
                                        >OK</v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="4">
                                <v-menu
                                    ref="menuDate"
                                    v-model="menuDateDelivery"
                                    :close-on-content-click="false"
                                    :return-value.sync="form.plannedDeliveryDate"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                            v-model="form.plannedDeliveryDate"
                                            label="Date de réception du don prévue"
                                            readonly
                                            v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker
                                        v-model="form.plannedDeliveryDate"
                                        no-title
                                        scrollable
                                    >
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            text
                                            color="primary"
                                            @click="menuDateDelivery = false"
                                        >Cancel</v-btn>
                                        <v-btn
                                            text
                                            color="primary"
                                            @click="$refs.menuDate.save(form.plannedDeliveryDate)"
                                        >OK</v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </v-col>

                            <v-col cols="4">
                                <v-autocomplete
                                    :items="status"
                                    label="Statut du don"
                                    v-model="form.status"
                                    item-text="text"
                                    item-value="value"
                                ></v-autocomplete>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="4">
                                <v-autocomplete
                                    :items="users"
                                    label="Personne en charge"
                                    v-model="form.user"
                                    :item-text="item => `${item.firstname} ${item.lastname}`"
                                    item-value="id"
                                ></v-autocomplete>
                            </v-col>
                            <v-col cols="4">
                                <v-autocomplete
                                    :items="status_usage"
                                    label="Statut du traitement"
                                    v-model="form.status_usage"
                                    item-text="text"
                                    item-value="value"
                                ></v-autocomplete>
                            </v-col>
                            <v-col cols="4">
                                <v-checkbox v-model="form.taxExemptionGiven" label="Jusficatif de défiscalisation donné"></v-checkbox>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12">
                                <v-textarea
                                    v-model="form.comment"
                                    label="Commentaire"
                                    rows="3"
                                    auto-grow
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn color="gray" text @click="$emit('update:dialog', false)">Annuler</v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="id" color="red" text @click="remove">Supprimer</v-btn>
                <v-btn color="green" text @click="save">Sauvegarder</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import gql from "graphql-tag";
import moment from "moment";

export default {
    name: "DonationEdition",
    props: ["id", "dialog"],
    data() {
        return {
            showDialog: false,
            menuDatePledg: false,
            menuDateDelivery: false,
            types: [
                { text: "Alimentation", value: "food" },
                { text: "Compétences-RH", value: "hr" },
                { text: "Transport", value: "transport" },
                { text: "Hébergement", value: "hosting" },
                { text: "Bien-être", value: "wellbeing" },
                { text: "Autre", value: "others" }
            ],
            status: [
                { text: "Promesse de don", value: "pledg" },
                { text: "Réceptionné APHP", value: "received" },
                { text: "Distribué", value: "distributed" }
            ],
            status_usage: [
                { text: "À traiter", value: "tobeprocessed" },
                { text: "Traitement en cours", value: "processing" },
                { text: "Traité", value: "processed" }
            ],
            form: {
                id: null,
                donor: "",
                contact: "",
                role: "",
                email: "",
                phone1: "",
                phone2: "",
                type: "food",
                measurable: true,
                quantity: 1,
                unit: "",
                comment: "",
                receivedAPHP: false,
                plannedDeliveryDate: moment().format("YYYY-MM-DD"),
                status: "pledg",
                status_usage: "tobeprocessed",
                pledgDate: moment().format("YYYY-MM-DD"),
                taxExemptionGiven: false,
                user: null
            }
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
        `
    },
    watch: {
        async dialog() {
            this.showDialog = this.dialog;

            if (this.showDialog && this.id) {
                const {
                    data: { donation }
                } = await this.$apollo.query({
                    query: gql`
                        query($id: ID!) {
                            donation(id: $id) {
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
                                }
                            }
                        }
                    `,
                    variables: {
                        id: this.id
                    },
                    skip() {
                        return this.id === null;
                    }
                });
                this.form = { ...donation, user: donation.user.id };
            } else {
                this.form = {
                    id: null,
                    donor: "",
                    contact: "",
                    role: "",
                    email: "",
                    phone1: "",
                    phone2: "",
                    type: "food",
                    measurable: true,
                    quantity: 1,
                    unit: "",
                    comment: "",
                    receivedAPHP: false,
                    plannedDeliveryDate: moment().format("YYYY-MM-DD"),
                    status: "pledg",
                    status_usage: "tobeprocessed",
                    pledgDate: moment().format("YYYY-MM-DD"),
                    taxExemptionGiven: false,
                    user: null
                };
            }
        }
    },
    methods: {
        async save() {
            if (!this.form.id) {
                // CREATE
                const { data: { createDonation: { donation } } } = await this.$apollo.mutate({
                    mutation: gql`
                        mutation(
                            $donor: String!
                            $contact: String!
                            $role: String!
                            $email: String!
                            $phone1: String!
                            $phone2: String!
                            $type: ENUM_DONATION_TYPE!
                            $comment: String
                            $quantity: Int!
                            $unit: String!
                            $receivedAPHP: Boolean!
                            $plannedDeliveryDate: Date!
                            $measurable: Boolean!
                            $status: ENUM_DONATION_STATUS!
                            $status_usage: ENUM_DONATION_STATUS_USAGE!
                            $pledgDate: Date!
                            $user: ID,
                            $taxExemptionGiven: Boolean!
                        ) {
                            createDonation(
                                input: {
                                    data: {
                                        donor: $donor
                                        contact: $contact
                                        role: $role
                                        email: $email
                                        phone1: $phone1
                                        phone2: $phone2
                                        type: $type
                                        comment: $comment
                                        quantity: $quantity
                                        unit: $unit
                                        receivedAPHP: $receivedAPHP
                                        plannedDeliveryDate: $plannedDeliveryDate
                                        measurable: $measurable
                                        status: $status
                                        status_usage: $status_usage
                                        pledgDate: $pledgDate
                                        user: $user
                                        taxExemptionGiven: $taxExemptionGiven
                                    }
                                }
                            ) {
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
                                    taxExemptionGiven
                                    user {
                                        id
                                        firstname
                                        lastname
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        ...this.form,
                        quantity: this.form.measurable ? this.form.quantity : 1
                    }
                });
                this.$emit("donation-add", donation)
            } else {
                await this.$apollo.mutate({
                    mutation: gql`
                        mutation(
                            $id: ID!
                            $donor: String!
                            $contact: String!
                            $role: String!
                            $email: String!
                            $phone1: String!
                            $phone2: String!
                            $type: ENUM_DONATION_TYPE!
                            $comment: String
                            $quantity: Int!
                            $unit: String!
                            $receivedAPHP: Boolean!
                            $plannedDeliveryDate: Date!
                            $measurable: Boolean!
                            $status: ENUM_DONATION_STATUS!
                            $status_usage: ENUM_DONATION_STATUS_USAGE!
                            $pledgDate: Date!
                            $user: ID
                            $taxExemptionGiven: Boolean!
                        ) {
                            updateDonation(
                                input: {
                                    where: { id: $id }
                                    data: {
                                        donor: $donor
                                        contact: $contact
                                        role: $role
                                        email: $email
                                        phone1: $phone1
                                        phone2: $phone2
                                        type: $type
                                        comment: $comment
                                        quantity: $quantity
                                        unit: $unit
                                        receivedAPHP: $receivedAPHP
                                        plannedDeliveryDate: $plannedDeliveryDate
                                        measurable: $measurable
                                        status: $status
                                        status_usage: $status_usage
                                        pledgDate: $pledgDate
                                        user: $user
                                        taxExemptionGiven: $taxExemptionGiven
                                    }
                                }
                            ) {
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
                                    taxExemptionGiven
                                    user {
                                        id
                                        firstname
                                        lastname
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        ...this.form,
                        quantity: this.form.measurable ? this.form.quantity : 1
                    }
                });
            }

            this.$emit("update:donationID", null)
            this.$emit("update:dialog", false);
        },
        async remove() {
            const res = await this.$dialog.warning({
                text:
                    "Voulez vous vraiment supprimer ce don ? Cette action est irréversible",
                title: "Attention",
                icon: "mdi-alert",
                actions: {
                    false: "Annuler",
                    true: "Supprimer"
                }
            });

            if (res) {
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
                        donationID: this.id
                    }
                });

                if (repartitions && repartitions.length > 0) {
                    const graphql = repartitions.reduce((acc, e) => {
                        acc += `
                        delete_${e.id}: deleteDonationRepartition(input: {
                            where: { id: "${e.id}" }
                        }) {
                            donationRepartition { id }
                        }
                        `
                        return acc
                    }, "")
                    await this.$apollo.mutate({
                        mutation: gql`mutation {
                            ${graphql}
                        }`
                    })
                }

                await this.$apollo.mutate({
                    mutation: gql`
                        mutation($id: ID!) {
                            deleteDonation(input: {
                                where: { id: $id }
                            }) {
                                donation {
                                    id
                                }
                            }
                        }`,
                    variables: {
                        id: this.id
                    }
                });
                this.$emit("donation-delete", this.id)
                this.$emit("update:donationID", null)
                this.$emit("update:dialog", false);
            }
        }
    },
    filters: {
        dateHuman: function(date) {
            return moment(date).format("dddd DD/MM/YYYY");
        }
    }
};
</script>
