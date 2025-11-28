import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

const SportScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.text}>Sport Screen</Text>
                <Text style={styles.subText}>Filter by sport coming soon...</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    subText: {
        color: '#94a3b8',
        marginTop: 10,
    },
});

export default SportScreen;
