<template>
    <v-app>
        <v-app-bar app color="primary" dark>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title
                class="headline text-uppercase"
                @click="$router.push({ name: 'Home' })"
            >
                <span>AP-HP</span>
                <span class="font-weight-light">Donations</span>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <template v-if="user">
                {{ user.firstname }} {{ user.lastname }}
                <v-btn text @click="logout">Déconnexion</v-btn>
            </template>
        </v-app-bar>

        <v-navigation-drawer dark v-model="drawer" app v-if="user" color="secondary">
            <v-list>
                <v-list-item @click="$router.push({ name: 'Home' })">
                    <v-list-item-action>
                        <v-icon>mdi-view-dashboard</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Dashboard</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="$router.push({ name: 'BySite' })">
                    <v-list-item-action>
                        <v-icon>mdi-hospital-building</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Rapport par établissement</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-content>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
export default {
    name: "App",

    data: () => ({
        drawer: true
    }),
    computed: {
        user() {
            return this.$store.state.user
        }
    },
    methods: {
        logout() {
            this.$store.dispatch('logout')
            window.location.href="/"
        }
    }
};
</script>
