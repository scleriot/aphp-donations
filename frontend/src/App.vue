<template>
    <v-app>
        <v-app-bar app color="primary" dark>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title
                class="headline text-uppercase"
                @click="$router.push({ name: 'Home' })"
            >
                <span>AP-HP</span>
                <span class="font-weight-light">Suivi des dons</span>
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
                <v-list-item @click="$router.push({ name: 'Tasks' })">
                    <v-list-item-action>
                        <v-icon>mdi-account</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Mes tâches</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="$router.push({ name: 'ReportBySite' })">
                    <v-list-item-action>
                        <v-icon>mdi-hospital-building</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Rapport Établissement</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="$router.push({ name: 'ReportByUser' })">
                    <v-list-item-action>
                        <v-icon>mdi-account</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Rapport Personnel</v-list-item-title>
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

    mounted() {
        document.title = "APHP Suivi des dons"
    },

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

<style lang="scss">
$ease-out: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);

ul.drag-list,
ul.drag-inner-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
    padding-left: 0;
}

.drag-container {
    margin: 20px auto;
}

.drag-list {
    display: -webkit-box;
    min-height: 600px;
    // align-items: flex-start;

    @media (max-width: 690px) {
        display: block;
    }
}

.drag-column {
    // flex: 1;
    width: 33%;
    margin-right: 10px;
    position: relative;
    background: rgba(black, 0.2);
    overflow: hidden;

    height: 60vh;
    overflow-y: scroll;

    @media (max-width: 690px) {
        margin-bottom: 30px;
    }

    h2 {
        font-size: 0.8rem;
        margin: 0;
        text-transform: uppercase;
        font-weight: 600;
    }
}

.drag-column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
}

.drag-inner-list {
    min-height: 600px;
    color: white;
}

.drag-item {
    // padding: 10px;
    margin: 10px;
    // height: 100px;
    // background: rgba(black, 0.4);
    transition: $ease-out;

    &.is-moving {
        transform: scale(1.5);
        background: rgba(black, 0.8);
    }

    .v-card:hover {
        background: rgba(rgb(216, 216, 216), 0.9);
    }

    p {
        margin: 0;
    }
}

.drag-header-more {
    cursor: pointer;
}

.drag-options {
    position: absolute;
    top: 44px;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 10px;
    transform: translateX(100%);
    opacity: 0;
    transition: $ease-out;

    &.active {
        transform: translateX(0);
        opacity: 1;
    }

    &-label {
        display: block;
        margin: 0 0 5px 0;

        input {
            opacity: 0.6;
        }

        span {
            display: inline-block;
            font-size: 0.9rem;
            font-weight: 400;
            margin-left: 5px;
        }
    }
}

/* Dragula CSS  */

.gu-mirror {
    position: fixed !important;
    margin: 0 !important;
    z-index: 9999 !important;
    opacity: 0.8;
    list-style-type: none;
}

.gu-hide {
    display: none !important;
}

.gu-unselectable {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
}

.gu-transit {
    opacity: 0.2;
}
</style>
