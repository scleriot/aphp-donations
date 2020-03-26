<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="elevation-12">
                    <v-toolbar color="primary" dark flat>
                        <v-toolbar-title>Connexion</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="email"
                                    label="E-mail"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    type="password"
                                    v-model="password"
                                    label="Mot de passe"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-btn color="success" :loading="loading" @click="handleSubmit">Connexion</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-overlay :value="loading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
    </v-container>
</template>

<script>
import { mapMutations } from "vuex";
import strapi from "@/strapi";

export default {
    name: "Signin",
    data() {
        return {
            email: "",
            password: "",
            loading: false
        };
    },
    methods: {
        async handleSubmit() {
            try {
                this.loading = true;
                const response = await strapi.login(this.email, this.password);
                this.loading = false;
                this.$store.dispatch("login", { user: response.user, jwt: response.jwt });
                window.location.href = "/"
            } catch (err) {
                console.log(err)
                this.loading = false;
            }
        },
        ...mapMutations({
            setUser: "setUser"
        })
    }
};
</script>
