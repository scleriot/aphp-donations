<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>Ma gestion des dons</v-card-title>
                    <v-card-text>
                        <kanban-board
                            :stages="stagesIDs"
                            :blocks="donations"
                            @update-block="updateBlock"
                        >
                            <div
                                v-for="stage in stages"
                                :slot="stage.id"
                                :key="stage.id"
                                style="width: 100%"
                            >
                                <h3>{{ stage.text }}</h3>
                            </div>

                            <div v-for="opp in donations" :slot="opp.id" :key="opp.id">
                                <v-card>
                                    <v-card-text>
                                        <h2>{{ opp.donor }}</h2>
                                        <p>{{ opp.contact }}</p>
                                        <p>
                                            <template v-if="opp.measurable">{{ opp.quantity }}</template>
                                            {{ opp.unit }}
                                        </p>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn color="warning" @click="edit(opp.id)" text>Éditer</v-btn>&nbsp;
                                        <v-btn
                                            v-if="opp.status_donation !== 'pledg'"
                                            color="success"
                                            @click="repartition(opp.id)"
                                            text
                                        >Répartir</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </div>
                        </kanban-board>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <donation-edition :id="editionID" :dialog.sync="showEditionDialog"></donation-edition>
        <repartition :donationID="repartitionDonationID" :dialog.sync="showRepartitionDialog"></repartition>
    </v-container>
</template>

<script>
import gql from "graphql-tag";

import DonationEdition from "@/components/DonationEdition.vue";
import Repartition from "@/components/Repartition.vue"

export default {
    name: "Tasks",
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
            stages: [
                { id: "tobeprocessed", text: "À traiter" },
                { id: "processing", text: "En cours" },
                { id: "processed", text: "Traité" }
            ]
        };
    },
    apollo: {
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
            variables() {
                return {
                    userID: this.$store.state.user.id
                };
            },
            update(data) {
                return data.donations.map(e => ({
                    ...e,
                    status: e.status_usage,
                    status_donation: e.status
                }));
            }
        }
    },
    computed: {
        stagesIDs() {
            return this.stages.map(e => e.id);
        }
    },
    methods: {
        updateBlock(id, stepId) {
            this.$apollo.mutate({
                mutation: gql`
                    mutation($id: ID!, $status: ENUM_DONATION_STATUS_USAGE!) {
                        updateDonation(
                            input: {
                                where: { id: $id }
                                data: { status_usage: $status }
                            }
                        ) {
                            donation {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    id,
                    status: stepId
                }
            });
        },
        edit(id) {
            this.editionID = id;
            this.showEditionDialog = true;
        },
        repartition(id) {
            this.repartitionDonationID = id
            this.showRepartitionDialog = true
        }
    }
};
</script>
